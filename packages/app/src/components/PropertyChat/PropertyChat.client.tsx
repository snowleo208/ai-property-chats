"use client";

import React from "react";
import { Separator } from "@radix-ui/themes";

import { useChat } from '@ai-sdk/react';
import { PromptTextArea } from "../PromptTextArea/PromptTextArea.client";
import Messages from "../Messages/Messages.client";

export const PropertyChat = () => {
  const { input, setInput, messages, append, stop, error, status } = useChat({
    api: '/api/ask',
    experimental_throttle: 50
  });

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setInput(e.target.value);
  }

  const onDefaultQuestionsClick = (value: string) => {
    append({
      role: 'user',
      content: value,
    })
  }

  const onSubmit = () => {
    append({
      role: 'user',
      content: input,
    })

    setInput('');
  }

  const isLoading = (status === 'submitted' || status === 'streaming');

  return (
    <>
      <Messages
        isLoading={isLoading}
        error={error}
        onDefaultQuestionsClick={onDefaultQuestionsClick}
        messages={messages}
      />

      <Separator my="3" size="4" />

      <PromptTextArea
        isLoading={isLoading}
        onStop={stop}
        onSubmit={onSubmit}
        inputValue={input}
        onInputChange={onInputChange}
      />
    </>
  );
};
