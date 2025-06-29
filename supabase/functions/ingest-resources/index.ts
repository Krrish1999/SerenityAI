import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.40.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// Supported API sources
type DataSource = 'pubmed' | 'youtube' | 'rss';

// Resource structure that matches our database schema
type ResourceData = {
  title: string;
  content: string;
  category: string[];
  thumbnail_url?: string;
  author: string;
  type: 'article' | 'video' | 'audio' | 'exercise' | 'tool';
  source_url?: string;
  duration?: number;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request parameters
    const url = new URL(req.url);
    const source = url.searchParams.get('source') as DataSource;
    const query = url.searchParams.get('query') || 'mental health';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    if (!source) {
      throw new Error('Source parameter is required (pubmed, youtube, or rss)');
    }

    // Get the authorization header for authenticated requests
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Fetch data from appropriate source
    let resources: ResourceData[] = [];

    switch(source) {
      case 'pubmed':
        resources = await fetchPubMedArticles(query, limit);
        break;
      case 'youtube':
        resources = await fetchYouTubeVideos(query, limit);
        break;
      case 'rss':
        resources = await fetchRssArticles(query, limit);
        break;
      default:
        throw new Error(`Unsupported source: ${source}`);
    }

    // Insert resources into database
    if (resources.length > 0) {
      const { error } = await supabaseClient
        .from('resources')
        .upsert(
          resources,
          { 
            onConflict: 'title',
            ignoreDuplicates: true
          }
        );

      if (error) throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        source,
        count: resources.length,
        resources
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error ingesting resources:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to ingest resources'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
});

// Function to fetch articles from PubMed
async function fetchPubMedArticles(query: string, limit: number): Promise<ResourceData[]> {
  try {
    // Use the NCBI E-utilities API to search PubMed
    // First get IDs
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${limit}`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`PubMed search failed: ${searchResponse.statusText}`);
    }
    
    const searchData = await searchResponse.json();
    const ids = searchData.esearchresult.idlist;
    
    if (!ids || ids.length === 0) {
      return [];
    }
    
    // Then fetch details for those IDs
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const summaryResponse = await fetch(summaryUrl);
    
    if (!summaryResponse.ok) {
      throw new Error(`PubMed summary failed: ${summaryResponse.statusText}`);
    }
    
    const summaryData = await summaryResponse.json();
    
    // Process results into our ResourceData format
    const articles: ResourceData[] = [];
    
    for (const id of ids) {
      const article = summaryData.result[id];
      if (article) {
        // Extract and format the abstract (if available separately, we'd need another API call)
        // For now, we'll use a placeholder description
        
        articles.push({
          title: article.title,
          content: article.description || `This article from PubMed discusses topics related to ${query}. Click the source link to read the full article on PubMed.`,
          category: ['Mental Health', 'Research', article.pubtype?.[0] || 'Article'].filter(Boolean),
          author: article.authors?.[0]?.name || 'PubMed Research',
          type: 'article',
          source_url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          thumbnail_url: 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        });
      }
    }
    
    return articles;
  } catch (error) {
    console.error('Error fetching from PubMed:', error);
    throw error;
  }
}

// Function to fetch videos from YouTube
async function fetchYouTubeVideos(query: string, limit: number): Promise<ResourceData[]> {
  try {
    // This is a mock implementation since we can't use the actual YouTube API in the Edge Function
    // In a real implementation, you would use the YouTube Data API with an API key
    
    // Sample data to demonstrate the concept
    const mockVideos = [
      {
        id: 'video1',
        title: 'Understanding Anxiety Disorders',
        description: 'Learn about the different types of anxiety disorders, their symptoms, and treatment options.',
        thumbnail: 'https://images.pexels.com/photos/3807738/pexels-photo-3807738.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        author: 'Mental Health Foundation',
        duration: 720, // 12 minutes
        url: 'https://www.youtube-nocookie.com/embed/idnJLZD0wWk'
      },
      {
        id: 'video2',
        title: 'Mindfulness Meditation for Beginners',
        description: 'A gentle introduction to mindfulness meditation practices that can help reduce stress and improve mental wellbeing.',
        thumbnail: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        author: 'Mindfulness Center',
        duration: 600, // 10 minutes
        url: 'https://www.youtube-nocookie.com/embed/inpok4MKVLM'
      },
      {
        id: 'video3',
        title: 'Cognitive Behavioral Therapy Techniques',
        description: 'Practical CBT techniques that you can use to challenge negative thought patterns and improve your mental health.',
        thumbnail: 'https://images.pexels.com/photos/3758105/pexels-photo-3758105.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        author: 'Therapy Explained',
        duration: 900, // 15 minutes
        url: 'https://www.youtube-nocookie.com/embed/HQrYI4XHXqQ'
      }
    ];
    
    // Convert to ResourceData format
    const videos: ResourceData[] = mockVideos.map(video => ({
      title: video.title,
      content: video.description,
      category: ['Mental Health', 'Video', 'Education'],
      thumbnail_url: video.thumbnail,
      author: video.author,
      type: 'video',
      source_url: video.url,
      duration: video.duration
    }));
    
    return videos.slice(0, limit);
  } catch (error) {
    console.error('Error fetching from YouTube:', error);
    throw error;
  }
}

// Function to fetch articles from RSS feeds
async function fetchRssArticles(query: string, limit: number): Promise<ResourceData[]> {
  try {
    // This is a mock implementation since parsing RSS feeds in Edge Functions can be complex
    // In a real implementation, you would fetch and parse actual RSS feeds
    
    // Sample data to demonstrate the concept
    const mockArticles = [
      {
        title: 'The Connection Between Sleep and Mental Health',
        content: 'Sleep and mental health are closely connected. Sleep deprivation affects your psychological state and mental health. And those with mental health problems are more likely to have insomnia or other sleep disorders.\n\nResearch shows that the relationship between sleep and mental health is complex. While sleep has long been known to be a consequence of many psychiatric conditions, more recent views suggest that sleep can also play a causal role in both the development and maintenance of different mental health problems.',
        category: ['Sleep', 'Mental Health', 'Wellness'],
        thumbnail: 'https://images.pexels.com/photos/3771115/pexels-photo-3771115.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        author: 'Psychology Today',
        url: 'https://www.psychologytoday.com/us/blog/sleep-mental-health'
      },
      {
        title: 'Nutrition and Its Impact on Mental Wellbeing',
        content: 'There is a growing body of evidence indicating that dietary factors and nutrition can influence mental health. The brain requires a constant supply of nutrients to function properly, and changes in diet can affect cognition, behavior, and emotions.\n\nResearch has shown that diets high in refined sugars are harmful to the brain and can worsen symptoms of mood disorders like depression. Conversely, diets rich in vegetables, fruits, unprocessed grains, fish, and seafood, with modest amounts of lean meats and dairy, have been associated with decreased risk of depression.',
        category: ['Nutrition', 'Mental Health', 'Wellness'],
        thumbnail: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        author: 'Mental Health America',
        url: 'https://www.mhanational.org/nutrition'
      }
    ];
    
    // Convert to ResourceData format
    const articles: ResourceData[] = mockArticles.map(article => ({
      title: article.title,
      content: article.content,
      category: article.category,
      thumbnail_url: article.thumbnail,
      author: article.author,
      type: 'article',
      source_url: article.url
    }));
    
    return articles.slice(0, limit);
  } catch (error) {
    console.error('Error fetching from RSS feeds:', error);
    throw error;
  }
}