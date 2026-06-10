'use client';

import {
  useDefinitions,
  useCreateDefinition,
  useDeleteDefinition,
  useUpdateDefinition,
} from 'src/api/definitions';

import { TaxonomyManager } from './taxonomy-manager';

// ----------------------------------------------------------------------

export function IdentitiesView() {
  const { data, isLoading } = useDefinitions('identity');
  const create = useCreateDefinition();
  const update = useUpdateDefinition();
  const remove = useDeleteDefinition();

  return (
    <TaxonomyManager
      title="هویت‌ها"
      description="فهرست هویت‌های میکرورسانه (ژورنالیست، بلاگر، روحانی، اینفلوئنسر و ...). هر میکرورسانه یک هویت دارد."
      icon="solar:user-id-bold-duotone"
      color="info"
      infoTips={['هر میکرورسانه یک هویت دارد.', 'هویت‌ها در طول زمان قابل افزودن/ویرایش/حذف‌اند.']}
      nameField="title"
      items={data}
      isLoading={isLoading}
      pending={create.isPending || update.isPending || remove.isPending}
      representativeScope="identity"
      onCreate={(p) => create.mutateAsync({ type: 'identity', title: p.name, description: p.description })}
      onUpdate={(id, p) => update.mutateAsync({ id, data: { title: p.name, description: p.description } })}
      onRemove={(id) => remove.mutateAsync({ id })}
    />
  );
}
