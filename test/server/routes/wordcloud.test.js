describe('Wordcloud API', () => {
  test('/api/wordcloud - length', (done) => {
    global.json({
      method: 'get',
      url: '/api/wordcloud?length=5',
      status: 200,
    }).then((data) => {
      expect(data.length).toBe(5);
      expect(data.reduce((acc, val) => acc + val.key, ''))
        .toBe(data.sort((a, b) => b.value - a.value).reduce((acc, val) => acc + val.key, ''));
      expect(data[0].key).toBe('New York');
      done();
    });
  });

  test('/api/wordcloud', (done) => {
    global.json({
      method: 'get',
      url: '/api/wordcloud',
      status: 200,
    }).then((data) => {
      expect(data.reduce((acc, val) => acc + val.key, ''))
        .toBe(data.sort((a, b) => {
          if (b.value - a.value === 0)
            return a.key > b.key ? 1 : -1;
          return b.value - a.value;
        }).reduce((acc, val) => acc + val.key, ''));
      expect(data[0].key).toBe('New York');
      done();
    });
  });
});
