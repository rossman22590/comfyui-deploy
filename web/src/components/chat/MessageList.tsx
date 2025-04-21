import React from 'react';
import Message, { MessageData } from './Message';

export interface MessageListProps {
  messages: MessageData[];
  expandedWorkflows: Record<string, boolean>;
  setExpandedWorkflows: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  collapsedUserWorkflows: Record<string, boolean>;
  setCollapsedUserWorkflows: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  expandedWorkflows,
  setExpandedWorkflows,
  collapsedUserWorkflows,
  setCollapsedUserWorkflows
}) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          expandedWorkflows={expandedWorkflows}
          setExpandedWorkflows={setExpandedWorkflows}
          collapsedUserWorkflows={collapsedUserWorkflows}
          setCollapsedUserWorkflows={setCollapsedUserWorkflows}
        />
      ))}
    </div>
  );
};

export default MessageList;
export type { MessageData } from './Message';