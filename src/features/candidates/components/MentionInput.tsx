import React, { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MENTION_USERS = [
  'hr_manager',
  'tech_lead',
  'recruiter',
  'hiring_manager',
  'admin'
];

export function MentionInput({ value, onChange, placeholder, disabled }: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Check for @ mention
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionStart(cursorPos - mentionMatch[0].length);
      setShowSuggestions(true);
      setSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSuggestionIndex(prev => 
          prev < MENTION_USERS.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : MENTION_USERS.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        insertMention(MENTION_USERS[suggestionIndex]);
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const insertMention = (username: string) => {
    if (mentionStart === -1) return;

    const beforeMention = value.substring(0, mentionStart);
    const afterCursor = value.substring(textareaRef.current?.selectionStart || 0);
    const newValue = `${beforeMention}@${username} ${afterCursor}`;
    
    onChange(newValue);
    setShowSuggestions(false);
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const renderTextWithMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <Badge key={index} variant="secondary" className="mx-1">
            {part}
          </Badge>
        );
      }
      return part;
    });
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[100px]"
      />
      
      {showSuggestions && (
        <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
          {MENTION_USERS.map((user, index) => (
            <div
              key={user}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                index === suggestionIndex ? 'bg-blue-100' : ''
              }`}
              onClick={() => insertMention(user)}
            >
              @{user}
            </div>
          ))}
        </div>
      )}
      
      {/* Preview of mentions */}
      {value && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
          <span className="text-gray-600">Preview: </span>
          {renderTextWithMentions(value)}
        </div>
      )}
    </div>
  );
}
