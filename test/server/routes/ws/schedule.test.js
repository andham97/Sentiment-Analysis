describe('Schedule API', () => {
  test('/api/ws/schedule', (done) => {
    global.json({
      url: '/api/ws/schedule',
    }).then((data) => {
      expect(data.filter(doc => doc.id === '31c57d4d-b342-4e24-9ad2-c5c54486991d').length).toBe(1);
      done();
    });
  });

  test('/api/ws/schedule - 400', (done) => {
    global.json({
      method: 'post',
      url: '/api/ws/schedule',
      status: 400,
      type: /text/,
    }).then(() => {
      done();
    });
  });

  test('/api/ws/schedule - POST', (done) => {
    global.json({
      method: 'post',
      url: '/api/ws/schedule',
      data: {
        task: 'cnn',
        recurring: false,
        occurences: [
          {
            hour: 12,
            minute: 0,
            second: 0,
          },
        ],
      },
    }).then((newJob) => {
      expect(JSON.stringify(newJob))
        .toBe(JSON.stringify({
          id: newJob.id,
          task: 'cnn',
          recurring: false,
          occurences: [
            {
              hour: 12,
              minute: 0,
              second: 0,
            },
          ],
        }));
      global.json({
        url: '/api/ws/schedule',
      }).then((schedule) => {
        expect(schedule.filter(job => job.id === newJob.id).length).toBe(1);
        done();
      });
    });
  });

  test('/api/ws/schedule - DELETE', (done) => {
    global.json({
      method: 'post',
      url: '/api/ws/schedule',
      data: {
        task: 'cnn',
        recurring: false,
        occurences: [
          {
            hour: 12,
            minute: 0,
            second: 0,
          },
        ],
      },
    }).then((newJob) => {
      global.json({
        method: 'delete',
        url: `/api/ws/schedule/${newJob.id}`,
      }).then(() => {
        global.json({
          url: '/api/ws/schedule',
        }).then((schedule) => {
          expect(schedule.filter(job => job.id === newJob.id).length).toBe(0);
          done();
        });
      });
    });
  });

  test('/api/ws/schedule - DELETE none', (done) => {
    global.json({
      method: 'delete',
      url: '/api/ws/schedule',
      status: 404,
      type: /text/,
    }).then(() => {
      done();
    });
  });
});
