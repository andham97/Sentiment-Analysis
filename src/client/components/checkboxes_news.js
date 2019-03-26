export function getNews() {
  return [
    {
      name: 'analysis_filter',
      key: 'aftenposten',
      value: 'Aftenposten',
    },
    {
      name: 'analysis_filter',
      key: 'cnn',
      value: 'CNN',
    },
    {
      name: 'analysis_filter',
      key: 'bbc',
      value: 'BBC',
    },
  ];
}

export const checkboxesNews = [
  {
    name: 'analysis_filter',
    key: 'aftenposten',
    value: 'Aftenposten',
  },
  {
    name: 'analysis_filter',
    key: 'cnn',
    value: 'CNN',
  },
  {
    name: 'analysis_filter',
    key: 'bbc',
    value: 'BBC',
  },
  {
    name: 'analysis_filter',
    key: 'newyorktimes',
    value: 'New York Times',
  },
  {
    name: 'analysis_filter',
    key: 'budstikka',
    value: 'Budstikka',
  },
];


export function newsSources(state, value) {
  return (
    state.name.toLowerCase().indexOf(value.toLowerCase()) !== -1
    || state.abbr.toLowerCase().indexOf(value.toLowerCase()) !== -1
  );
}
