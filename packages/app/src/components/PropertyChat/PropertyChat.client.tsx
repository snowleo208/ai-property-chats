"use client";

import React, { useState } from "react";

import { useChat } from '@ai-sdk/react';
import { PromptTextArea } from "../PromptTextArea/PromptTextArea.client";
import Messages from "../Messages/Messages.client";

export const PropertyChat = () => {
  const [currentInputValue, setCurrentInputValue] = useState('');
  const { messages, append, stop, error, status } = useChat({
    api: '/api/ask',
    experimental_throttle: 100
  });

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setCurrentInputValue(e.target.value);
  }

  const onDefaultQuestionsClick = (value: string) => {
    append({
      role: 'user',
      content: value,
    })
  }

  const onStop = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    stop();
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement | HTMLTextAreaElement>) => {
    e.preventDefault();
    if (currentInputValue === '') {
      return;
    }

    append({
      role: 'user',
      content: currentInputValue,
    })

    setCurrentInputValue('');
  }

  const isLoading = (status === 'submitted' || status === 'streaming');

  return (
    <>
      <Messages
        isLoading={isLoading}
        error={error}
        onDefaultQuestionsClick={onDefaultQuestionsClick}
        messages={messages}
        status={status}
      />

      <PromptTextArea
        isLoading={isLoading}
        onStop={onStop}
        onSubmit={onSubmit}
        inputValue={currentInputValue}
        onInputChange={onInputChange}
      />
    </>
  );
};
