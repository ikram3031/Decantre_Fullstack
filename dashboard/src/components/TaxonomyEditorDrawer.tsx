import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Award, FolderOpen, Plus, X } from 'lucide-react';

export type TaxonomyEditorMode = 'categories' | 'brands';
export type TaxonomyEditorAction = 'add' | 'edit';

interface ParentOption {
  id: string | number;
  name: string;
}

interface TaxonomyEditorDrawerProps {
  open: boolean;
  mode: TaxonomyEditorMode;
  action: TaxonomyEditorAction;
  initialName?: string;
  initialParentId?: string;
  parentOptions: ParentOption[];
  isSaving?: boolean;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    parentId: string | null;
  }) => void;
}

export const TaxonomyEditorDrawer: React.FC<TaxonomyEditorDrawerProps> = ({
  open,
  mode,
  action,
  initialName = '',
  initialParentId = '',
  parentOptions,
  isSaving,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialName);
  const [parentId, setParentId] = useState(initialParentId);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setParentId(initialParentId);
    }
  }, [open, initialName, initialParentId]);

  if (!open) {
    return null;
  }

  const isBrand = mode === 'brands';
  const title = action === 'add' ? `Add New ${isBrand ? 'Brand' : 'Category'}` : `Edit ${isBrand ? 'Brand' : 'Category'}`;
  const description = action === 'add'
    ? `Create a fresh ${isBrand ? 'brand' : 'category'} and publish it to your store taxonomy.`
    : `Update the ${isBrand ? 'brand' : 'category'} details and save changes.`;
  const Icon = isBrand ? Award : FolderOpen;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 top-0 md:inset-y-12 md:left-1/2 md:-translate-x-1/2 md:w-[min(95%,720px)]">
        <div className="relative mx-auto flex h-full min-h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-t-[28px] bg-white border border-slate-200 shadow-2xl md:rounded-[28px] md:min-h-[unset] md:max-h-[calc(100vh-4rem)] animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 bg-white">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
                <p className="text-sm text-slate-500 mt-1">{description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim()) {
                return;
              }
              onSave({ name: name.trim(), parentId: parentId || null });
            }}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-700">{isBrand ? 'Brand Name' : 'Category Name'}</Label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={isBrand ? 'e.g. Apex Sport' : 'e.g. Footwear'}
                className="bg-slate-50 border-slate-200 focus:border-slate-950"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-700">{isBrand ? 'Parent Brand (Optional)' : 'Parent Category (Optional)'}</Label>
              <select
                value={parentId}
                onChange={(event) => setParentId(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-950"
              >
                <option value="">None (Top-Level)</option>
                {parentOptions.map((option) => (
                  <option key={option.id} value={String(option.id)}>
                    {option.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                {isBrand
                  ? 'Choose a parent brand to create a sub-brand relationship.'
                  : 'Choose a parent category to nest this item inside another category.'}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !name.trim()}
                className="w-full sm:w-auto"
              >
                {action === 'add' ? 'Create' : 'Save'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
