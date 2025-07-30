import { http, HttpResponse } from 'msw';
import { attendanceModel } from '../data/attendance';

export const attendanceHandlers = [
  // Get attendance records
  http.get('/api/attendance/records', ({ request }) => {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');
    const date = url.searchParams.get('date');
    
    let records = attendanceModel.attendanceRecord.getAll();
    
    if (employeeId) {
      records = records.filter(record => record.employeeId === employeeId);
    }
    
    if (date) {
      records = records.filter(record => 
        record.date.startsWith(date)
      );
    }

    return HttpResponse.json({ attendanceRecords: records });
  }),

  // Clock in/out
  http.post('/api/attendance/checkin', async ({ request }) => {
    const clockData = await request.json() as any;
    const newRecord = attendanceModel.attendanceRecord.create({
      ...clockData,
      date: new Date().toISOString(),
      clockIn: new Date().toISOString(),
      status: 'Present'
    });
    return HttpResponse.json(newRecord, { status: 201 });
  }),

  http.post('/api/attendance/checkout', async ({ request }) => {
    const body = await request.json() as any;
    const { recordId, ...updateData } = body;
    const updatedRecord = attendanceModel.attendanceRecord.update({
      where: { id: { equals: recordId } },
      data: {
        ...updateData,
        clockOut: new Date().toISOString()
      }
    });

    return HttpResponse.json(updatedRecord);
  })
];