import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatAssistant from '../components/ChatAssistant';

// Mock fetch
global.fetch = vi.fn();

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe('ChatAssistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UI Rendering', () => {
    it('renders chat button when closed', () => {
      render(<ChatAssistant />);
      
      const button = screen.getByRole('button', { name: /open chat assistant/i });
      expect(button).toBeInTheDocument();
    });

    it('opens chat window when button is clicked', () => {
      render(<ChatAssistant />);
      
      const button = screen.getByRole('button', { name: /open chat assistant/i });
      fireEvent.click(button);
      
      expect(screen.getByText(/Always here to help/i)).toBeInTheDocument();
    });

    it('displays welcome message when opened', () => {
      render(<ChatAssistant pageContext="general" />);
      
      const button = screen.getByRole('button', { name: /open chat assistant/i });
      fireEvent.click(button);
      
      expect(screen.getByText(/Hi! I'm your AI assistant/i)).toBeInTheDocument();
    });

    it('displays context-specific welcome message', () => {
      render(<ChatAssistant pageContext="courses" />);
      
      const button = screen.getByRole('button', { name: /open chat assistant/i });
      fireEvent.click(button);
      
      expect(screen.getByText(/help you with courses/i)).toBeInTheDocument();
    });

    it('shows quick actions on first open', () => {
      render(<ChatAssistant pageContext="general" />);
      
      const button = screen.getByRole('button', { name: /open chat assistant/i });
      fireEvent.click(button);
      
      expect(screen.getByText(/Quick actions:/i)).toBeInTheDocument();
      expect(screen.getByText(/How do I get started?/i)).toBeInTheDocument();
    });

    it('can minimize and maximize chat window', () => {
      render(<ChatAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open chat assistant/i });
      fireEvent.click(openButton);
      
      const minimizeButton = screen.getByRole('button', { name: /minimize/i });
      fireEvent.click(minimizeButton);
      
      // Quick actions should be hidden when minimized
      expect(screen.queryByText(/Quick actions:/i)).not.toBeInTheDocument();
      
      const maximizeButton = screen.getByRole('button', { name: /maximize/i });
      fireEvent.click(maximizeButton);
      
      // Quick actions should be visible again
      expect(screen.getByText(/Quick actions:/i)).toBeInTheDocument();
    });

    it('closes chat window when close button is clicked', () => {
      render(<ChatAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open chat assistant/i });
      fireEvent.click(openButton);
      
      const closeButton = screen.getByRole('button', { name: /close chat/i });
      fireEvent.click(closeButton);
      
      // Should show the open button again
      expect(screen.getByRole('button', { name: /open chat assistant/i })).toBeInTheDocument();
    });
  });

  describe('Message Sending', () => {
    it('allows user to type and send messages', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'Test response',
          conversationId: 'test-123'
        })
      });

      render(<ChatAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open chat assistant/i });
      fireEvent.click(openButton);
      
      const input = screen.getByPlaceholderText(/Type your message/i);
      const sendButton = screen.getByRole('button', { name: /send message/i });
      
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.click(sendButton);
      
      // User message should appear
      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument();
      });
      
      // Response should appear
      await waitFor(() => {
        expect(screen.getByText('Test response')).toBeInTheDocument();
      });
    });

    it('sends message on Enter key press', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'Test response',
          conversationId: 'test-123'
        })
      });

      render(<ChatAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open chat assistant/i });
      fireEvent.click(openButton);
      
      const input = screen.getByPlaceholderText(/Type your message/i);
      
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
      
      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument();
      });
    });

    it('does not send empty messages', () => {
      render(<ChatAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open chat assistant/i });
      fireEvent.click(openButton);
      
      const sendButton = screen.getByRole('button', { name: /send message/i });
      
      // Send button should be disabled when input is empty
      expect(sendButton).toBeDisabled();
    });

    it('sends quick action messages', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'Here is how to get started...',
          conversationId: 'test-123'
        })
      });

      render(<ChatAssistant pageContext="general" />);
      
      const openButton = screen.getByRole('button', { name: /open chat assistant/i });
      fireEvent.click(openButton);
      
      const quickAction = screen.getByText(/How do I get started?/i);
      fireEvent.click(quickAction);
      
      await waitFor(() => {
        expect(screen.getByText(/How do I get started?/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(<ChatAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open chat assistant/i });
      fireEvent.click(openButton);
      
      const input = screen.getByPlaceholderText(/Type your message/i);
      const sendButton = screen.getByRole('button', { name: /send message/i });
      
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/having trouble connecting/i)).toBeInTheDocument();
      });
    });

    it('displays error message when API returns non-ok response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      render(<ChatAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open chat assistant/i });
      fireEvent.click(openButton);
      
      const input = screen.getByPlaceholderText(/Type your message/i);
      const sendButton = screen.getByRole('button', { name: /send message/i });
      
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/having trouble connecting/i)).toBeInTheDocument();
      });
    });

    it('disables input while loading', async () => {
      (global.fetch as any).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ response: 'Test', conversationId: 'test-123' })
        }), 100))
      );

      render(<ChatAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open chat assistant/i });
      fireEvent.click(openButton);
      
      const input = screen.getByPlaceholderText(/Type your message/i) as HTMLInputElement;
      const sendButton = screen.getByRole('button', { name: /send message/i });
      
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.click(sendButton);
      
      // Input should be disabled while loading
      expect(input.disabled).toBe(true);
      
      await waitFor(() => {
        expect(input.disabled).toBe(false);
      });
    });
  });

  describe('Conversation History', () => {
    it('maintains conversation ID across messages', async () => {
      const conversationId = 'test-conversation-123';
      
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            response: 'First response',
            conversationId
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            response: 'Second response',
            conversationId
          })
        });

      render(<ChatAssistant />);
      
      const openButton = screen.getByRole('button', { name: /open chat assistant/i });
      fireEvent.click(openButton);
      
      const input = screen.getByPlaceholderText(/Type your message/i);
      const sendButton = screen.getByRole('button', { name: /send message/i });
      
      // Send first message
      fireEvent.change(input, { target: { value: 'First message' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('First response')).toBeInTheDocument();
      });
      
      // Send second message
      fireEvent.change(input, { target: { value: 'Second message' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Second response')).toBeInTheDocument();
      });
      
      // Check that conversationId was sent in second request
      expect(global.fetch).toHaveBeenCalledTimes(2);
      const secondCall = (global.fetch as any).mock.calls[1];
      const secondCallBody = JSON.parse(secondCall[1].body);
      expect(secondCallBody.conversationId).toBe(conversationId);
    });
  });
});
