import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Send, Volume2, Loader2, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'voice' | 'text';
}

interface VoiceInteractionProps {
  onVoiceInput: (text: string) => void;
}

export function VoiceInteraction({ onVoiceInput }: VoiceInteractionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AlphaGenome assistant. You can speak or type your observations about the analyzed sequence. I\'ll help refine predictions and suggest experiments.',
      timestamp: new Date(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      
      // Simulate voice processing
      setTimeout(() => {
        const transcribedText = 'The sequence appears to be active in liver tissue based on my preliminary data.';
        handleUserMessage(transcribedText, 'voice');
        setIsProcessing(false);
      }, 1500);
    } else {
      setIsRecording(true);
    }
  };

  const handleUserMessage = (text: string, type: 'voice' | 'text' = 'text') => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      type,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    onVoiceInput(text);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Based on your observation about liver tissue activity, I\'ve updated the predictions. The sequence now shows increased confidence for hepatocyte-specific enhancer activity. I recommend performing a ChIP-seq for HNF4α to validate this hypothesis.',
        'Interesting observation! This context helps narrow down the regulatory function. Consider that liver-specific enhancers often contain binding sites for HNF1α, HNF4α, and C/EBP family members. Should I search for these motifs in your sequence?',
        'Thank you for this additional context. Liver-specific activity suggests potential involvement in metabolic gene regulation. I\'ve generated a new hypothesis focused on testing enhancer activity in HepG2 cells.',
      ];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleUserMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="glass-panel p-4 flex flex-col h-full max-h-[400px]">
      <div className="section-header">
        <Volume2 className="w-4 h-4" />
        Voice Interaction
      </div>

      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <div className="space-y-3">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex gap-2 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.type === 'voice' && (
                    <Badge variant="secondary" className="mb-1 text-[10px]">
                      <Mic className="w-2 h-2 mr-1" />
                      Voice
                    </Badge>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <span className="text-[10px] opacity-60 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                {message.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="mt-4 space-y-2">
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 py-2 bg-destructive/10 rounded-lg text-destructive"
          >
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-4 bg-destructive rounded-full"
                  animate={{ scaleY: [1, 1.5, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
            <span className="text-sm font-medium">Recording...</span>
          </motion.div>
        )}

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 py-2 bg-muted rounded-lg"
          >
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Processing voice...</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Button
            type="button"
            variant={isRecording ? 'destructive' : 'secondary'}
            size="icon"
            onClick={toggleRecording}
            disabled={isProcessing}
            className={isRecording ? 'pulse-recording' : ''}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your observation..."
            className="flex-1"
          />
          <Button type="submit" disabled={!inputText.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
