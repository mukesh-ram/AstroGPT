import { Injectable, signal } from '@angular/core';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { ChatMessage, NatalChart } from '../models/natal-chart.model';
import { v4 as uuidv4 } from 'uuid'; // we'll use a simple fallback

@Injectable({ providedIn: 'root' })
export class ChatService {
  messages = signal<ChatMessage[]>([]);
  isStreaming = signal(false);
  currentStreamContent = signal('');
  sessionId = signal(this.generateSessionId());

  private readonly apiBase = 'https://astrogpt-backend.onrender.com/api';

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substring(2, 15);
  }

  async sendMessage(question: string, chart: NatalChart | null): Promise<void> {
    const userMsg: ChatMessage = { role: 'user', content: question, timestamp: new Date() };
    this.messages.update(msgs => [...msgs, userMsg]);
    this.isStreaming.set(true);
    this.currentStreamContent.set('');

    const history = this.messages().slice(-10).map(m => ({ role: m.role, content: m.content }));

    const abortController = new AbortController();
    let assistantContent = '';

    try {
      await fetchEventSource(`${this.apiBase}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId(),
          message: question,
          chart: chart,
          history: history
        }),
        signal: abortController.signal,
        openWhenHidden: true,
        onmessage: (event) => {
          if (event.event === 'token') {
            assistantContent += event.data;
            this.currentStreamContent.set(assistantContent);
          } else if (event.event === 'done') {
            const assistantMsg: ChatMessage = {
              role: 'assistant',
              content: assistantContent,
              timestamp: new Date()
            };
            this.messages.update(msgs => [...msgs, assistantMsg]);
            this.isStreaming.set(false);
            this.currentStreamContent.set('');
            abortController.abort();
          } else if (event.event === 'error') {
            const errorMsg: ChatMessage = {
              role: 'assistant',
              content: 'Error: ' + event.data + '\n(Check your GOOGLE_API_KEY in the backend .env file)',
              timestamp: new Date()
            };
            this.messages.update(msgs => [...msgs, errorMsg]);
            this.isStreaming.set(false);
            this.currentStreamContent.set('');
            abortController.abort();
          }
        },
        onerror: (err) => {
          console.error('SSE Error:', err);
          this.isStreaming.set(false);
          throw err;
        }
      });
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.error('Chat error:', e);
        this.isStreaming.set(false);
      }
    }
  }

  clearHistory(): void {
    this.messages.set([]);
    this.sessionId.set(this.generateSessionId());
  }
}
