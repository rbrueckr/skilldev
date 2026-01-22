import React from 'react';
import './index.css';
import TagView from './tag';
import useTagPage from '../../../hooks/useTagPage';
import AskQuestionButton from '../askQuestionButton';
import ScrollArea from '../../ui/scroll-area';
import Separator from '../../ui/separator';
import Skeleton from '../../ui/skeleton';

/**
 * Represents the TagPage component which displays a list of tags
 * and provides functionality to handle tag clicks and ask a new question.
 */
const TagPage = () => {
  const { tlist, clickTag, isLoading } = useTagPage();

  // Skeleton loading UI
  const renderSkeletons = () =>
    Array(9)
      .fill(0)
      .map((_, i) => (
        <div key={i} className='bg-card rounded-lg border border-border p-4'>
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-6 w-24 mb-1' />
            <Skeleton className='h-4 w-full mb-1' />
            <Skeleton className='h-4 w-full mb-1' />
            <Skeleton className='h-6 w-16 mt-2' />
          </div>
        </div>
      ));

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-4 flex flex-col items-center'>
        <h2 className='text-xl font-semibold mb-2'>All Tags</h2>
        <div className='mb-1'>
          <AskQuestionButton />
        </div>
        {isLoading ? (
          <Skeleton className='h-5 w-28 mt-1' />
        ) : (
          <p className='text-sm text-muted-foreground'>{tlist.length} tags available</p>
        )}
      </div>

      <Separator className='mb-6' />

      <ScrollArea className='h-[calc(100vh-200px)]'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1'>
          {isLoading
            ? renderSkeletons()
            : tlist.map(t => <TagView key={t.name} t={t} clickTag={clickTag} />)}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TagPage;
