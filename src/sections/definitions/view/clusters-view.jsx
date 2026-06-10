'use client';

import {
  useClusters,
  useCreateCluster,
  useDeleteCluster,
  useUpdateCluster,
} from 'src/api/definitions';

import { TaxonomyManager } from './taxonomy-manager';

// ----------------------------------------------------------------------

export function ClustersView() {
  const { data, isLoading } = useClusters();
  const create = useCreateCluster();
  const update = useUpdateCluster();
  const remove = useDeleteCluster();

  return (
    <TaxonomyManager
      title="خوشه‌ها (موضوع فعالیت)"
      description="فهرست خوشه‌های موضوعی که میکرورسانه‌ها ذیل آن‌ها دسته‌بندی می‌شوند. می‌توانید خوشه اضافه، ویرایش یا حذف کنید."
      icon="solar:folder-with-files-bold-duotone"
      color="warning"
      infoTips={['هر میکرورسانه یک خوشهٔ موضوعی دارد.', 'حذف خوشه‌ای که در حال استفاده است ممکن است با خطا مواجه شود.']}
      nameField="name"
      items={data}
      isLoading={isLoading}
      pending={create.isPending || update.isPending || remove.isPending}
      representativeScope="cluster"
      onCreate={(p) => create.mutateAsync({ name: p.name, description: p.description })}
      onUpdate={(id, p) => update.mutateAsync({ id, data: { name: p.name, description: p.description } })}
      onRemove={(id) => remove.mutateAsync({ id })}
    />
  );
}
