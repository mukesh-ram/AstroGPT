import { Component, ElementRef, Input, ViewChild, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { NatalChart } from '../../../core/models/natal-chart.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container glass-card">
      <div class="chat-header">
        <div class="header-info">
          <h3>AstroGPT</h3>
          <span class="status" [class.streaming]="isStreaming()">
            {{ isStreaming() ? 'Consulting the stars...' : 'Online' }}
          </span>
        </div>
        <button class="btn-clear" (click)="clearHistory()" title="Clear History">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
          </svg>
        </button>
      </div>

      <div class="messages-area" #scrollMe>
        <div class="message assistant animate-in">
          <div class="avatar">✨</div>
          <div class="content">Namaste! I am AstroGPT, your Vedic astrology guide. Ask me anything about your chart!</div>
        </div>

        <div *ngFor="let msg of messages()" class="message animate-in" [class.user]="msg.role === 'user'" [class.assistant]="msg.role === 'assistant'">
          <div class="avatar">{{ msg.role === 'user' ? '👤' : '✨' }}</div>
          <div class="content" *ngIf="msg.role === 'user'">{{ msg.content }}</div>
          <div class="content markdown-body" *ngIf="msg.role === 'assistant'" [innerHTML]="formatMarkdown(msg.content)"></div>
        </div>

        <div *ngIf="isStreaming()" class="message assistant streaming-msg">
          <div class="avatar">✨</div>
          <div class="content markdown-body" [innerHTML]="formatMarkdown(currentStreamContent() + ' <span class=\\'cursor\\'></span>')"></div>
        </div>
      </div>

      <div class="input-area">
        <textarea 
          [(ngModel)]="userInput" 
          (keydown)="onKeyDown($event)"
          placeholder="Ask about your career, marriage, doshas..." 
          rows="1"
          [disabled]="isStreaming()"
        ></textarea>
        <button class="btn-send" (click)="sendMessage()" [disabled]="!userInput.trim() || isStreaming()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }

    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: rgba(13,17,40,0.6);
    }

    .chat-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-glass);
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        font-family: 'Cinzel', serif;
        font-size: 18px;
        color: var(--color-primary-light);
        margin-bottom: 4px;
      }

      .status {
        font-size: 12px;
        color: var(--color-text-muted);
        display: flex;
        align-items: center;
        gap: 6px;

        &::before {
          content: '';
          display: block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-success);
        }

        &.streaming::before {
          background: var(--color-accent);
          animation: pulse 1s infinite;
        }
      }

      .btn-clear {
        background: transparent;
        border: none;
        color: var(--color-text-muted);
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        transition: var(--transition);
        
        &:hover {
          background: rgba(255,255,255,0.1);
          color: var(--color-error);
        }
      }
    }

    .messages-area {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .message {
      display: flex;
      gap: 12px;
      max-width: 85%;

      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-secondary);
        border: 1px solid var(--border-glass);
        flex-shrink: 0;
      }

      .content {
        padding: 12px 16px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.5;
        white-space: pre-wrap;
      }

      &.user {
        align-self: flex-end;
        flex-direction: row-reverse;

        .content {
          background: rgba(255,255,255,0.05);
          border-top-right-radius: 4px;
        }
      }

      &.assistant {
        align-self: flex-start;

        .content {
          background: rgba(123,94,167,0.15);
          border: 1px solid rgba(123,94,167,0.3);
          border-top-left-radius: 4px;
        }
      }
    }

    .markdown-body {
      color: var(--color-text);
    }
    .markdown-body p { margin-top: 0; margin-bottom: 10px; }
    .markdown-body p:last-child { margin-bottom: 0; }
    .markdown-body strong { color: var(--color-primary-light); }
    .markdown-body h1, .markdown-body h2, .markdown-body h3 { font-family: 'Cinzel', serif; margin-top: 15px; margin-bottom: 10px; color: var(--color-primary-light); }
    .markdown-body ul, .markdown-body ol { margin-left: 20px; margin-bottom: 10px; }
    .markdown-body li { margin-bottom: 4px; }

    .cursor {
      display: inline-block;
      width: 6px;
      height: 14px;
      background: var(--color-primary-light);
      margin-left: 4px;
      vertical-align: middle;
      animation: blink 1s step-end infinite;
    }

    @keyframes blink {
      50% { opacity: 0; }
    }

    .input-area {
      padding: 16px;
      border-top: 1px solid var(--border-glass);
      display: flex;
      gap: 12px;
      align-items: flex-end;

      textarea {
        flex: 1;
        background: rgba(255,255,255,0.05);
        border: 1px solid var(--border-glass);
        border-radius: 12px;
        padding: 12px 16px;
        color: var(--color-text);
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        resize: none;
        max-height: 120px;
        outline: none;
        transition: var(--transition);

        &:focus {
          border-color: var(--color-primary);
          background: rgba(255,255,255,0.08);
        }
        
        &::placeholder {
          color: var(--color-text-muted);
        }
        
        &:disabled {
          opacity: 0.5;
        }
      }

      .btn-send {
        background: var(--color-primary);
        color: white;
        border: none;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: var(--transition);

        &:hover:not(:disabled) {
          background: var(--color-primary-light);
          transform: translateY(-2px);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  `]
})
export class ChatInterfaceComponent implements AfterViewChecked {
  @Input() chart?: NatalChart;
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  
  userInput = '';
  
  private chatService = inject(ChatService);
  private sanitizer = inject(DomSanitizer);

  messages = this.chatService.messages;
  isStreaming = this.chatService.isStreaming;
  currentStreamContent = this.chatService.currentStreamContent;

  constructor() {}

  formatMarkdown(text: string): SafeHtml {
    if (!text) return '';
    try {
      const parsed = marked.parse(text) as string;
      const sanitized = DOMPurify.sanitize(parsed, { ADD_ATTR: ['class'] });
      return this.sanitizer.bypassSecurityTrustHtml(sanitized);
    } catch (e) {
      return this.sanitizer.bypassSecurityTrustHtml(text);
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isStreaming()) return;
    
    const question = this.userInput;
    this.userInput = '';
    this.chatService.sendMessage(question, this.chart || null);
  }

  clearHistory() {
    this.chatService.clearHistory();
  }
}
