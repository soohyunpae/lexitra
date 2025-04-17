import { prisma } from '../../../lib/prisma';

export async function deleteProjectFromDB(projectId: string) {
  try {
    console.log(`Attempting to delete project with ID: ${projectId}`); // 로그 추가
    const deletedProject = await prisma.project.delete({
        where: {
            id: Number(projectId),
          },
        });
        return deletedProject;
      } catch (e) {
        console.error('Error deleting project:', e);  // 더 구체적인 로그
        throw new Error('Failed to delete project');
      }
    }