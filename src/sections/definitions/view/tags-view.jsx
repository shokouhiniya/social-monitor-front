'use client';

import {
  useDefinitions,
  useCreateDefinition,
  useDeleteDefinition,
  useUpdateDefinition,
} from 'src/api/definitions';

import { TaxonomyManager } from './taxonomy-manager';

// ----------------------------------------------------------------------

export function TagsView() {
  const { data, isLoading } = useDefinitions('tag');
  const create = useCreateDefinition();
  const update = useUpdateDefinition();
  const remove = useDeleteDefinition();

  return (
    <TaxonomyManager
      title="برچسب‌ها"
      description="فهرست برچسب‌های قابل‌استفاده در تسک‌ها، میکرورسانه‌ها و سایر بخش‌ها. برچسب‌ها از پیش تعریف می‌شوند و کاربران از میان آنها انتخاب می‌کنند."
      icon="solar:tag-bold-duotone"
      color="secondary"
      infoTips={['برچسب‌ها در تعریف تسک و فیلتر کردن استفاده می‌شوند.', 'هر برچسب عنوان و توضیح اختیاری دارد.']}
      nameField="title"
      items={data}
      isLoading={isLoading}
      pending={create.isPending || update.isPending || remove.isPending}
      onCreate={(p) => create.mutateAsync({ type: 'tag', title: p.name, description: p.description })}
      onUpdate={(id, p) => update.mutateAsync({ id, data: { title: p.name, description: p.description } })}
      onRemove={(id) => remove.mutateAsync({ id })}
    />
  );
}
