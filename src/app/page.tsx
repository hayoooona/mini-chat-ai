'use client';

import { MemoizedReactMarkdown } from '@/components/shared/Markdown';
import { useTheme } from 'next-themes';
import { ChangeEvent, FormEvent, useState } from 'react';

type Chat = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const { theme, setTheme } = useTheme();

  const [messages, setMessages] = useState<Chat[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

    const userRequest: Chat = {
      role: 'user',
      content: input,
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [
          // 이전 히스토리를 보내야... 기억하고 그거에 맞춰서 대답이 옵니다.
          ...messages,
          userRequest,
        ],
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) return;

    let content = '';
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const decodedValue = decoder.decode(value);
      content += decodedValue;

      setMessages([
        ...messages,
        userRequest,
        { role: 'assistant', content: content },
      ]);
    }

    setLoading(false);
  }

  return (
    <>
      <div className='bg-black dark:bg-black'>
        {messages.map((message, index) => (
          <div key={index} className='flex'>
            <div>{message.role}</div>
            <div>
              <MemoizedReactMarkdown>{message.content}</MemoizedReactMarkdown>
            </div>
          </div>
        ))}
        <form onSubmit={handleSubmit}>
          <input
            placeholder='이곳에서 질문해보세요!'
            value={input}
            onChange={(e) => handleChange(e)}
          />
          <button type='submit' disabled={!input || isLoading}>
            보내기
          </button>
        </form>
      </div>
    </>
  );
}
