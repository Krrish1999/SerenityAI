import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BookOpen } from 'lucide-react';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { MoodPicker } from '../ui/MoodPicker';
import { useJournalStore } from '../../store/journalStore';
import { useAuthStore } from '../../store/authStore';
import { JournalEntry } from '../../types';

type JournalFormProps = {
  entry?: JournalEntry;
  isEditing?: boolean;
};

type FormValues = {
  title: string;
  content: string;
  tags: string;
};

export const JournalForm: React.FC<JournalFormProps> = ({ entry, isEditing = false }) => {
  const [selectedMood, setSelectedMood] = useState(entry?.mood || 3);
  const { createJournalEntry, updateJournalEntry, isLoading } = useJournalStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      title: entry?.title || '',
      content: entry?.content || '',
      tags: entry?.tags?.join(', ') || '',
    }
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) return;

    const tags = data.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (isEditing && entry) {
      await updateJournalEntry(entry.id, {
        title: data.title,
        content: data.content,
        mood: selectedMood,
        tags
      });
      navigate(`/journal/${entry.id}`);
    } else {
      await createJournalEntry(
        user.id,
        data.title,
        data.content,
        selectedMood,
        tags
      );
      navigate('/journal');
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          {isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <Input
            label="Title"
            placeholder="Give your entry a title"
            {...register('title', { required: 'Title is required' })}
            error={errors.title?.message}
            fullWidth
          />
          
          <MoodPicker
            selectedMood={selectedMood}
            onChange={setSelectedMood}
          />
          
          <TextArea
            label="Write your thoughts"
            placeholder="What's on your mind today?"
            rows={8}
            {...register('content', { required: 'Content is required' })}
            error={errors.content?.message}
            fullWidth
          />
          
          <Input
            label="Tags (optional)"
            placeholder="Enter tags separated by commas (e.g. anxiety, work, family)"
            {...register('tags')}
            helperText="Tags help you organize your journal entries"
            fullWidth
          />
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(isEditing && entry ? `/journal/${entry.id}` : '/journal')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isEditing ? 'Update Entry' : 'Save Entry'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};