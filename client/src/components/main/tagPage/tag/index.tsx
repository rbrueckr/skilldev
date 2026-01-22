import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './index.css';
import { TagData } from '../../../../types/types';
import useTagSelected from '../../../../hooks/useTagSelected';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { cn } from '../../../../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';

/**
 * Props for the Tag component.
 *
 * t - The tag object.
 * clickTag - Function to handle the tag click event.
 */
interface TagProps {
  t: TagData;
  clickTag: (tagName: string) => void;
}

/**
 * Tag component that displays information about a specific tag.
 * The component displays the tag's name, description, and the number of associated questions.
 * It also triggers a click event to handle tag selection.
 *
 * @param t - The tag object .
 * @param clickTag - Function to handle tag clicks.
 */
const TagView = ({ t, clickTag }: TagProps) => {
  const { tag } = useTagSelected(t);
  const [expanded, setExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <>
      <div
        className='bg-card hover:bg-accent/50 rounded-lg border border-border p-4 transition-colors duration-200 cursor-pointer'
        onClick={() => {
          clickTag(t.name);
        }}>
        <div className='flex flex-col gap-2'>
          <Badge
            variant='outline'
            className='w-fit text-xs font-semibold bg-primary/10 text-primary border-primary/20 mb-1'>
            {tag.name}
          </Badge>

          <div className='relative'>
            <p className={cn('text-sm text-muted-foreground', expanded ? '' : 'line-clamp-2 h-10')}>
              {tag.description}
            </p>

            {tag.description && tag.description.length > 80 && (
              <div className='flex justify-end mt-1'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-6 px-2 text-xs'
                  onClick={toggleExpanded}>
                  {expanded ? (
                    <>
                      Show Less <ChevronUp className='ml-1 h-3 w-3' />
                    </>
                  ) : (
                    <>
                      Show More <ChevronDown className='ml-1 h-3 w-3' />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className='mt-2'>
            <span className='inline-flex items-center rounded-md bg-secondary/20 px-2 py-1 text-xs font-medium text-secondary-foreground'>
              {t.qcnt} {t.qcnt === 1 ? 'question' : 'questions'}
            </span>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>{tag.name}</DialogTitle>
            <DialogDescription className='pt-4'>{tag.description}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TagView;
