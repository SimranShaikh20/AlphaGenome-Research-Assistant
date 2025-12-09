import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Send, Loader2, User, Bot } from 'lucide-react';

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

function WaveformVisualization() {
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-red-500 rounded-full"
          animate={{ 
            height: [8, 24, 8],
          }}
          transition={{ 
            duration: 0.5, 
            repeat: Infinity, 
            delay: i * 0.05,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

export function VoiceInteraction({ onVoiceInput }: VoiceInteractionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AlphaGenome assistant. Speak or type your observations about the analyzed sequence.',
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
    
    setTimeout(() => {
      const responses = [
        'Based on your observation about liver tissue activity, I\'ve updated the predictions. Consider ChIP-seq for HNF4α to validate.',
        'Interesting! Liver-specific enhancers often contain HNF1α, HNF4α, and C/EBP binding sites. Should I search for these motifs?',
        'Thank you for this context. I\'ve generated a new hypothesis focused on testing enhancer activity in HepG2 cells.',
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
    <div className="space-y-4">
      {/* Large microphone button */}
      <div className="flex flex-col items-center">
        <motion.button
          onClick={toggleRecording}
          disabled={isProcessing}
          className={`mic-button ${isRecording ? 'mic-button-recording' : ''}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isRecording ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </motion.button>
        
        <p className="text-sm text-muted-foreground mt-2">
          {isRecording ? 'Listening...' : 'Tap to speak'}
        </p>

        {/* Waveform when recording */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <WaveformVisualization />
            </motion.div>
          )}
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mt-3 text-primary"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Processing...</span>
          </motion.div>
        )}
      </div>

      {/* Chat messages */}
      <ScrollArea className="h-[200px] pr-3" ref={scrollRef}>
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
                  className={`max-w-[85%] rounded-xl px-3 py-2 ${
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

      {/* Text input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your observation..."
          className="flex-1"
        />
        <Button type="submit" disabled={!inputText.trim()} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
