import { deleteProjectFromDB } from './deleteProjectFromDB'; // 삭제 함수 임포트

export async function DELETE(req: Request) {
  try {
    // 쿼리 파라미터에서 ID 추출
    const projectId = req.url.split('?')[1]?.split('=')[1]; 

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        { status: 400 }
      );
    }

    // 프로젝트 삭제
    const deletedProject = await deleteProjectFromDB(projectId);

    if (!deletedProject) {
      return new Response(
        JSON.stringify({ error: 'Failed to delete project' }),
        { status: 400 }
      );
    }

    // 성공적으로 삭제된 경우
    return new Response(
      JSON.stringify({ success: true, deletedProject }),
      { status: 200 }
    );
  } catch (e) {
    console.error('Error deleting project:', e);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}