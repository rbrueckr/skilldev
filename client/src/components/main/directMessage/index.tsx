import React from 'react';
import {
  MessageSquarePlus,
  Send,
  Users,
  MailPlus,
  X,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import useDirectMessage from '../../../hooks/useDirectMessage';
import UsersListPage from '../usersListPage';
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
import { Input } from '../../ui/input';
import ScrollArea from '../../ui/scroll-area';
import { Alert, AlertDescription } from '../../ui/alert';
import Separator from '../../ui/separator';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';

/**
 * DirectMessage component renders a page for direct messaging between users.
 * It includes a list of users and a chat window to send and receive messages.
 */
const DirectMessage = () => {
  const {
    selectedChat,
    chatToCreate,
    chats,
    newMessage,
    setNewMessage,
    showCreatePanel,
    setShowCreatePanel,
    handleSendMessage,
    handleChatSelect,
    handleUserSelect,
    handleCreateChat,
    error,
  } = useDirectMessage();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='container mx-auto p-4 max-w-6xl'>
      {/* Start Chat Panel */}
      <Card className='mb-6'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <MessageSquarePlus className='h-5 w-5 text-primary' />
              <CardTitle>Direct Messages</CardTitle>
            </div>
            <Button
              variant={showCreatePanel ? 'destructive' : 'default'}
              size='sm'
              onClick={() => setShowCreatePanel(prevState => !prevState)}>
              {showCreatePanel ? (
                <>
                  <X className='mr-2 h-4 w-4' /> Hide Panel
                </>
              ) : (
                <>
                  <MailPlus className='mr-2 h-4 w-4' /> Start a Chat
                </>
              )}
            </Button>
          </div>
          <CardDescription>Chat privately with other users in your network</CardDescription>
        </CardHeader>

        {error && (
          <CardContent className='pt-0'>
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        )}

        {showCreatePanel && (
          <CardContent className='pt-0'>
            <Separator className='my-4' />
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Users className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>
                  {chatToCreate ? `Selected user: ${chatToCreate}` : 'Select a user to chat with'}
                </span>
              </div>

              {chatToCreate && (
                <Button onClick={handleCreateChat}>
                  <MessageSquare className='mr-2 h-4 w-4' /> Create New Chat
                </Button>
              )}

              <div className='bg-muted/30 p-4 rounded-md'>
                <UsersListPage handleUserSelect={handleUserSelect} />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Chat Interface */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Chats List */}
        <Card className='md:col-span-1'>
          <CardHeader>
            <CardTitle className='text-lg'>Recent Chats</CardTitle>
          </CardHeader>
          <Separator />
          <ScrollArea className='h-[500px] p-4'>
            {chats.length > 0 ? (
              <div className='space-y-2'>
                {chats.map(chat => (
                  <div
                    key={String(chat._id)}
                    onClick={() => handleChatSelect(chat._id)}
                    className='p-3 rounded-md hover:bg-muted cursor-pointer transition-colors'>
                    <div className='flex items-center gap-3'>
                      <Avatar>
                        <AvatarFallback className='bg-primary/10 text-primary'>
                          {chat.participants[0].substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='font-medium'>{chat.participants.join(', ')}</div>
                        {chat.messages.length > 0 && (
                          <p className='text-sm text-muted-foreground truncate max-w-[180px]'>
                            {chat.messages[chat.messages.length - 1].msg}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-10 text-muted-foreground'>
                <MessageSquare className='h-10 w-10 mx-auto mb-3 opacity-20' />
                <p>No chats yet</p>
                <p className='text-sm'>Start a new conversation</p>
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Chat Window */}
        <Card className='md:col-span-2'>
          {selectedChat ? (
            <>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Avatar>
                      <AvatarFallback className='bg-primary/10 text-primary'>
                        {selectedChat.participants[0].substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className='text-lg'>
                        Chat with {selectedChat.participants.join(', ')}
                      </CardTitle>
                      <CardDescription>{selectedChat.messages.length} messages</CardDescription>
                    </div>
                  </div>
                  <Badge variant='outline'>{selectedChat.participants.length} participants</Badge>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className='p-0'>
                <ScrollArea className='h-[400px] p-4'>
                  <div className='space-y-4'>
                    {selectedChat.messages.length > 0 ? (
                      selectedChat.messages.map(message => (
                        <MessageCard key={String(message._id)} message={message} />
                      ))
                    ) : (
                      <div className='text-center py-10 text-muted-foreground'>
                        <p>No messages yet</p>
                        <p className='text-sm'>Start the conversation</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              <CardFooter className='p-4 pt-2'>
                <div className='flex w-full gap-2'>
                  <Input
                    className='flex-1'
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder='Type a message...'
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className='h-4 w-4 mr-2' /> Send
                  </Button>
                </div>
              </CardFooter>
            </>
          ) : (
            <div className='flex items-center justify-center h-[600px] text-center p-6'>
              <div className='max-w-sm'>
                <MessageSquare className='h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20' />
                <h3 className='text-lg font-medium mb-2'>No chat selected</h3>
                <p className='text-muted-foreground'>
                  Select a conversation from the list or start a new chat to begin messaging
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DirectMessage;
