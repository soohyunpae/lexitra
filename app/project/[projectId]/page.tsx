import ProjectPage from '@/components/ProjectPage';

type Props = {
  params: { projectId: string };
};

export default async function Page({ params }: Props) {
  const id = parseInt(params?.projectId ?? '', 10);
  return <ProjectPage projectId={id} />;
}
