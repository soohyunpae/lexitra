import { prisma } from '../../../lib/prisma';

export async function deleteProjectFromDB(projectId: string) {
  try {
    console.log(`Attempting to delete project with ID: ${projectId}`);
    
    await prisma.translationUnit.deleteMany({
      where: { projectId: Number(projectId) },
    });

    await prisma.projectFile.deleteMany({
      where: { projectId: Number(projectId) },
    });

    const deletedProject = await prisma.project.delete({
      where: {
        id: Number(projectId),
      },
    });
    return deletedProject;
  } catch (e) {
    console.error('Error deleting project:', e);
    throw new Error('Failed to delete project');
  }
}