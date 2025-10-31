import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Assessment, AssessmentSection, AssessmentQuestion } from '@/lib/db';
import { Plus, Trash2, Eye, Save } from 'lucide-react';
import { AssessmentRuntime } from './AssessmentRuntime';

const questionSchema = z.object({
  id: z.string().optional(), // Made optional since it's generated on save
  title: z.string().min(1, 'Question title is required'),
  description: z.string().optional(),
  type: z.enum(['single-choice', 'multi-choice', 'short-text', 'long-text', 'numeric', 'file-upload']),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  maxLength: z.number().optional(),
});

const sectionSchema = z.object({
  id: z.string().optional(), // Made optional since it's generated on save
  title: z.string().min(1, 'Section title is required'),
  questions: z.array(questionSchema),
});

const assessmentSchema = z.object({
  id: z.string().optional(), // Made optional since it's generated on save
  jobId: z.string(),
  title: z.string().min(1, 'Assessment title is required'),
  description: z.string().optional(),
  sections: z.array(sectionSchema),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

type AssessmentForm = z.infer<typeof assessmentSchema>;

interface AssessmentBuilderProps {
  jobId: string;
}

export function AssessmentBuilder({ jobId }: AssessmentBuilderProps) {
  const [previewMode, setPreviewMode] = useState(false);
  const queryClient = useQueryClient();

  const { data: assessment, isLoading } = useQuery<Assessment | null>({
    queryKey: ['assessment', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/assessments/${jobId}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to fetch assessment');
      const data = await response.json();
      return data as Assessment;
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AssessmentForm>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      title: assessment?.title || '',
      description: assessment?.description || '',
      sections: assessment?.sections || [
        {
          id: crypto.randomUUID(),
          title: 'General Questions',
          questions: [],
        },
      ],
    },
  });

  const sections = watch('sections');

  const saveAssessmentMutation = useMutation({
    mutationFn: async (data: AssessmentForm) => {
      const response = await fetch(`/api/assessments/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          id: assessment?.id || crypto.randomUUID(),
          jobId,
        }),
      });
      if (!response.ok) throw new Error('Failed to save assessment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment', jobId] });
    },
  });

  const addSection = () => {
    const newSection: AssessmentSection = {
      id: crypto.randomUUID(),
      title: 'New Section',
      questions: [],
    };
    setValue('sections', [...sections, newSection]);
  };

  const updateSection = (index: number, updates: Partial<AssessmentSection>) => {
    const updatedSections = [...sections];
    updatedSections[index] = { ...updatedSections[index], ...updates };
    setValue('sections', updatedSections);
  };

  const deleteSection = (index: number) => {
    const updatedSections = sections.filter((_, i) => i !== index);
    setValue('sections', updatedSections);
  };

  const addQuestion = (sectionIndex: number) => {
    const newQuestion: AssessmentQuestion = {
      id: crypto.randomUUID(),
      type: 'short-text',
      title: 'New Question',
      required: false,
    };
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions.push(newQuestion);
    setValue('sections', updatedSections);
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, updates: Partial<AssessmentQuestion>) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions[questionIndex] = {
      ...updatedSections[sectionIndex].questions[questionIndex],
      ...updates,
    };
    setValue('sections', updatedSections);
  };

  const deleteQuestion = (sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions.splice(questionIndex, 1);
    setValue('sections', updatedSections);
  };

  const onSubmit = (data: AssessmentForm) => {
    saveAssessmentMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading assessment...</div>;
  }

  if (previewMode) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Preview</h2>
          <Button onClick={() => setPreviewMode(false)}>
            <Eye className="h-4 w-4 mr-2" />
            Back to Builder
          </Button>
        </div>
        <AssessmentRuntime assessment={assessment} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Builder */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assessment Title</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g., Frontend Developer Assessment"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  {...register('description')}
                  placeholder="Brief description of the assessment"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Sections</h3>
                  <Button type="button" onClick={addSection} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>

                {sections.map((section, sectionIndex) => (
                  <Card key={section.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                          className="font-semibold"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteSection(sectionIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Questions</h4>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => addQuestion(sectionIndex)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                          </Button>
                        </div>

                        {section.questions.map((question, questionIndex) => (
                          <Card key={question.id} className="p-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 space-y-2">
                                  <Input
                                    value={question.title}
                                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, { title: e.target.value })}
                                    placeholder="Question title"
                                  />
                                  <Input
                                    value={question.description || ''}
                                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, { description: e.target.value })}
                                    placeholder="Question description (optional)"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteQuestion(sectionIndex, questionIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label>Type</Label>
                                  <select
                                    value={question.type}
                                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, { type: e.target.value as any })}
                                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
                                  >
                                    <option value="short-text">Short Text</option>
                                    <option value="long-text">Long Text</option>
                                    <option value="single-choice">Single Choice</option>
                                    <option value="multi-choice">Multi Choice</option>
                                    <option value="numeric">Numeric</option>
                                    <option value="file-upload">File Upload</option>
                                  </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`required-${question.id}`}
                                    checked={question.required}
                                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, { required: e.target.checked })}
                                  />
                                  <Label htmlFor={`required-${question.id}`}>Required</Label>
                                </div>
                              </div>

                              {question.type === 'single-choice' || question.type === 'multi-choice' ? (
                                <div>
                                  <Label>Options (one per line)</Label>
                                  <textarea
                                    value={question.options?.join('\n') || ''}
                                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, { options: e.target.value.split('\n').filter(Boolean) })}
                                    className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                                  />
                                </div>
                              ) : null}

                              {question.type === 'numeric' ? (
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label>Min Value</Label>
                                    <Input
                                      type="number"
                                      value={question.min || ''}
                                      onChange={(e) => updateQuestion(sectionIndex, questionIndex, { min: parseInt(e.target.value) || undefined })}
                                    />
                                  </div>
                                  <div>
                                    <Label>Max Value</Label>
                                    <Input
                                      type="number"
                                      value={question.max || ''}
                                      onChange={(e) => updateQuestion(sectionIndex, questionIndex, { max: parseInt(e.target.value) || undefined })}
                                    />
                                  </div>
                                </div>
                              ) : null}

                              {question.type === 'short-text' || question.type === 'long-text' ? (
                                <div>
                                  <Label>Max Length</Label>
                                  <Input
                                    type="number"
                                    value={question.maxLength || ''}
                                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, { maxLength: parseInt(e.target.value) || undefined })}
                                  />
                                </div>
                              ) : null}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewMode(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button type="submit" disabled={saveAssessmentMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {saveAssessmentMutation.isPending ? 'Saving...' : 'Save Assessment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Live Preview</h3>
        <div className="border rounded-lg p-4 bg-gray-50">
          <AssessmentRuntime assessment={assessment} />
        </div>
      </div>
    </div>
  );
}
