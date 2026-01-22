import React from 'react';
import { MessageCircle, Send, AlertCircle, Users } from 'lucide-react';
import './index.css';
import useMessagingPage from '../../../hooks/useMessagingPage';
import MessageCard from '../messageCard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../../ui/card';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import ScrollArea from '../../ui/scroll-area';
import { Alert, AlertDescription } from '../../ui/alert';
import Separator from '../../ui/separator';
import { Badge } from '../../ui/badge';

/**
 * Represents the MessagingPage component which displays the public chat room.
 * and provides functionality to send and receive messages.
 */
const MessagingPage = () => {
  const { messages, newMessage, setNewMessage, handleSendMessage, error } = useMessagingPage();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='container mx-auto p-4 max-w-4xl'>
      <Card className='shadow-md'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <MessageCircle className='h-5 w-5 text-primary' />
              <CardTitle>Global Chat Room</CardTitle>
            </div>
            <Badge variant='outline' className='flex items-center gap-1'>
              <Users className='h-3.5 w-3.5' />
              <span>Public</span>
            </Badge>
          </div>
          <CardDescription>
            Chat with all members of the community in this public space
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className='p-0'>
          <ScrollArea className='h-[500px] p-4'>
            <div className='space-y-4'>
              {messages.length > 0 ? (
                messages.map(message => <MessageCard key={String(message._id)} message={message} />)
              ) : (
                <div className='text-center py-10 text-muted-foreground'>
                  <MessageCircle className='h-10 w-10 mx-auto mb-3 opacity-20' />
                  <p>No messages yet</p>
                  <p className='text-sm'>Be the first to start the conversation</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className='p-4 pt-2'>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className='flex flex-col w-full gap-2'>
            <Textarea
              placeholder='Type your message here... (Press Enter to send)'
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className='min-h-[80px] resize-none'
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className='self-end'>
              <Send className='h-4 w-4 mr-2' /> Send Message
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MessagingPage;
