"use client";

import React, { useState } from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from '@ai-sdk/react';

import { PromptTextArea } from "../PromptTextArea/PromptTextArea.client";
import Messages from "../Messages/Messages.client";
import { Header } from "../Header/Header";

export const PropertyChat = () => {
  const [currentInputValue, setCurrentInputValue] = useState('');
  const { setMessages, messages, sendMessage, stop, error, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ask',
    }),
    experimental_throttle: 100
  });

  const onStop = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    stop();
  }

  const onDefaultQuestionsClick = (value: string) => {
    sendMessage({
      text: value,
    })
  }

  const onClickStartButton = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    stop();
    setMessages([]);
    setCurrentInputValue('');
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement | HTMLTextAreaElement>) => {
    e.preventDefault();
    if (currentInputValue === '') {
      return;
    }

    sendMessage({
      text: currentInputValue,
    })

    setCurrentInputValue('');
  }

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setCurrentInputValue(e.target.value);
  }

  const isLoading = (status === 'submitted' || status === 'streaming');

  return (
    <>
      <Header onClickStartButton={onClickStartButton} />
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
