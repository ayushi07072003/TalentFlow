import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Assessment } from '@/lib/db';
import { CheckCircle, Upload } from 'lucide-react';

interface AssessmentRuntimeProps {
  assessment?: Assessment | null;
  onSubmit?: (data: any) => void;
  isReadOnly?: boolean;
}

export function AssessmentRuntime({ assessment, onSubmit, isReadOnly = false }: AssessmentRuntimeProps) {
  if (!assessment) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No assessment available</p>
      </div>
    );
  }

  // Create validation schema based on assessment structure
  const createValidationSchema = (assessment: Assessment) => {
    const fields: Record<string, z.ZodTypeAny> = {};
    
    assessment.sections.forEach((section) => {
      section.questions.forEach((question) => {
        let fieldSchema: z.ZodTypeAny;
        
        switch (question.type) {
          case 'short-text':
          case 'long-text':
            fieldSchema = z.string();
            if (question.required) fieldSchema = fieldSchema.min(1, 'This field is required');
            if (question.maxLength) fieldSchema = fieldSchema.max(question.maxLength, `Maximum ${question.maxLength} characters`);
            break;
          case 'numeric':
            fieldSchema = z.number();
            if (question.required) fieldSchema = fieldSchema.min(0, 'This field is required');
            if (question.min !== undefined) fieldSchema = fieldSchema.min(question.min, `Minimum value is ${question.min}`);
            if (question.max !== undefined) fieldSchema = fieldSchema.max(question.max, `Maximum value is ${question.max}`);
            break;
          case 'single-choice':
            fieldSchema = z.string();
            if (question.required) fieldSchema = fieldSchema.min(1, 'Please select an option');
            break;
          case 'multi-choice':
            fieldSchema = z.array(z.string());
            if (question.required) fieldSchema = fieldSchema.min(1, 'Please select at least one option');
            break;
          case 'file-upload':
            fieldSchema = z.any();
            if (question.required) fieldSchema = fieldSchema.refine((val) => val && val.length > 0, 'Please upload a file');
            break;
          default:
            fieldSchema = z.string();
        }
        
        fields[question.id] = fieldSchema;
      });
    });
    
    return z.object(fields);
  };

  const validationSchema = createValidationSchema(assessment);
  type FormData = z.infer<typeof validationSchema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
  });

  const watchedValues = watch();

  // Check conditional logic for questions
  const shouldShowQuestion = (question: any) => {
    if (!question.conditionalLogic) return true;
    
    const { questionId, operator, value } = question.conditionalLogic;
    const watchedValue = watchedValues[questionId];
    
    if (!watchedValue) return false;
    
    switch (operator) {
      case 'equals':
        return watchedValue === value;
      case 'not-equals':
        return watchedValue !== value;
      case 'contains':
        return String(watchedValue).includes(String(value));
      case 'greater-than':
        return Number(watchedValue) > Number(value);
      case 'less-than':
        return Number(watchedValue) < Number(value);
      default:
        return true;
    }
  };

  const handleFormSubmit = (data: FormData) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      console.log('Assessment submitted:', data);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{assessment.title}</h2>
        {assessment.description && (
          <p className="text-gray-600 mt-2">{assessment.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {assessment.sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.questions.map((question) => {
                if (!shouldShowQuestion(question)) return null;

                return (
                  <div key={question.id} className="space-y-2">
                    <Label className="text-sm font-medium">
                      {question.title}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    {question.description && (
                      <p className="text-sm text-gray-600">{question.description}</p>
                    )}

                    {question.type === 'short-text' && (
                      <Input
                        {...register(question.id)}
                        disabled={isReadOnly}
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'long-text' && (
                      <textarea
                        {...register(question.id)}
                        disabled={isReadOnly}
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'numeric' && (
                      <Input
                        type="number"
                        {...register(question.id, { valueAsNumber: true })}
                        disabled={isReadOnly}
                        placeholder="Enter a number"
                        min={question.min}
                        max={question.max}
                      />
                    )}

                    {question.type === 'single-choice' && (
                      <div className="space-y-2">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              {...register(question.id)}
                              value={option}
                              disabled={isReadOnly}
                              className="text-blue-600"
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'multi-choice' && (
                      <div className="space-y-2">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              {...register(question.id)}
                              value={option}
                              disabled={isReadOnly}
                              className="text-blue-600"
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'file-upload' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {isReadOnly ? 'File upload not available in preview' : 'Click to upload or drag and drop'}
                        </p>
                        {!isReadOnly && (
                          <input
                            type="file"
                            {...register(question.id)}
                            className="mt-2"
                          />
                        )}
                      </div>
                    )}

                    {errors[question.id] && (
                      <p className="text-sm text-red-500">{errors[question.id]?.message}</p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

        {!isReadOnly && (
          <div className="flex justify-end">
            <Button type="submit" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Submit Assessment</span>
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
