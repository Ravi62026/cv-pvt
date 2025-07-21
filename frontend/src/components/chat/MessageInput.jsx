import React from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

const MessageInput = ({
  value,
  onChange,
  onKeyDown,
  onSend,
  isSending,
  placeholder = "Type a message...",
  showAttachments = true,
  showEmoji = true
}) => {
  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-end space-x-3">
        {/* Attachment Button */}
        {showAttachments && (
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Paperclip className="h-5 w-5 text-gray-600" />
          </button>
        )}

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            style={{
              minHeight: '44px',
              maxHeight: '120px',
            }}
          />
        </div>

        {/* Emoji Button */}
        {showEmoji && (
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Smile className="h-5 w-5 text-gray-600" />
          </button>
        )}

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={!value.trim() || isSending}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
