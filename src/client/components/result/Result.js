import React, { Component } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import stt from 'search-text-tokenizer';
import Alert from 'react-s-alert';
import Card from '../Card';
import Header from '../Header';
import DatePickerInterval from '../DatePickerInterval';
import DonutChart from './graph/DonutChart';
import Parameteres from './Parameters';
import '../style/Result.css';
import NewsArticle from './NewsArticle';
import Dropdown from '../Dropdown';
import Checkbox from '../Checkbox';
import Button from '../Button';
import { SearchContext } from '../dashboard/SearchStore';

const classNameMap = (name) => {
  switch (name) {
    case 'anger':
      return 'anger';
    case 'sadness':
      return 'sadness';
    case 'fear':
      return 'fear';
    case 'joy':
      return 'joy';
    case 'disgust':
      return 'disgust';
    default:
      return [];
  }
};

const coloranger = '#E26D5A';
const colorfear = '#3A405A';
const colorjoy = '#D3C0CD';
const colorsad = '#3D70B2';
const colordisgust = '#9FAF90';

class Result extends Component {
  constructor(props) {
    super(props);
    this.state = {
      averageArray: [],
      checkedEmotion: [],
      etSelection: false,
    };
    this.handleCheckedEmotion = this.handleCheckedEmotion.bind(this);
  }

  componentWillMount() {
    if (!this.context.search && localStorage.getItem('prev-search'))
      this.context.getSearch(localStorage.getItem('prev-search'));
    this.setState({
      ...this.state,
      checkedEmotion: [...this.context.searchOpts.checkedItemsEmotion],
    });
  }

  makeRedirect(url) {
    if (typeof url !== 'undefined') {
      window.open(url, '_blank');
    }
  }

  handleCheckedEmotion(emotion) {
    const item = emotion.target.value;
    const isChecked = emotion.target.checked;
    const cs = this.state.checkedEmotion;
    if (isChecked && cs.indexOf(item) === -1)
      cs.push(item);
    else if (!isChecked && cs.indexOf(item) > -1)
      cs.splice(cs.indexOf(item), 1);
    this.setState({ ...this.state, checkedEmotion: cs });
  }

  dateChange(date) {
    const opts = JSON.parse(JSON.stringify(this.context.searchOpts));
    let startDate = !date || !date.startDate ? this.state.startDate : date.startDate;
    let endDate = !date || !date.endDate ? this.state.endDate : date.endDate;
    if (!date) {
      startDate = new Date(0);
      endDate = new Date();
    }
    if (!startDate)
      startDate = this.context.searchOpts.startDate;
    if (!endDate)
      endDate = this.context.searchOpts.endDate;
    if (!startDate.getTime)
      startDate = new Date(startDate);
    if (!endDate.getTime)
      endDate = new Date(endDate);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    startDate = startDate.getTime();
    endDate = endDate.getTime();
    if (date && date.startDate && this.context.search.docs[this.context.search.docs.length - 1]
      .date - (24 * 60 * 60 * 1000) > startDate && this.state.startDate)
      Alert.warning('Provided "from" date is outside current search results', { position: 'top' });
    else if (date && date.endDate && this.context.search.docs[0]
      .date + (24 * 60 * 60 * 1000) < endDate && this.state.endDate)
      Alert.warning('Provided "to" date is outside current search results', { position: 'top' });
    opts.startDate = startDate;
    opts.endDate = endDate;
    this.context.computeSearch(this.context.search, opts);
  }

  render() {
    let { startDate, endDate } = this.state;
    if (!startDate)
      startDate = this.context.searchOpts.startDate;
    if (!endDate)
      endDate = this.context.searchOpts.endDate;
    if (startDate.getTime)
      startDate = startDate.getTime();
    if (endDate.getTime)
      endDate = endDate.getTime();
    const emotionSearch = this.state.checkedEmotion.length === 0
      ? this.context.search.docs : this.context.search.docs
        .filter(item => item.analysis.emotion
          && this.state.checkedEmotion.indexOf(Object.keys(item.analysis.emotion)
            .sort((a, b) => Math.abs(item.analysis.emotion[b])
              - Math.abs(item.analysis.emotion[a]))[0]) > -1);
    const filterEmotion = ((startDate || endDate)
      ? emotionSearch.filter(doc => (startDate ? doc.date >= startDate : true)
        && (endDate ? doc.date <= endDate : true)) : emotionSearch)
      .filter(item => item.analysis.emotion);
    return (
      <React.Fragment>
        <Header class='result_header' name='Sentiment Analysis' />
        <div className = 'result'>
          <div className = 'result_filter'>
              <div className= 'filter_bar'>
                <div className='test'>
                  <Dropdown className='clickable' titleList='Emotion' items={
                    this.context.graphData.map((item, i) => <Checkbox
                        key={i}
                        id={item.title}
                        value={item.title[0].toUpperCase() + item.title.slice(1)}
                        checked={this.state.checkedEmotion.indexOf(item.title) > -1}
                        onChange={emotion => this.handleCheckedEmotion(emotion)}
                      />)
                  } />
                  <Dropdown className='clickable' titleList='Date Interval' items={<DatePickerInterval change={(date) => {
                    this.setState({
                      ...this.state,
                      etSelection: false,
                      startDate: date.startDate === null ? undefined : date.startDate,
                      endDate: date.endDate === null ? undefined : date.endDate,
                    });
                    this.dateChange({
                      startDate: date.startDate === null
                        ? this.context.search.docs[this.context.search.docs.length - 1].date
                        : date.startDate,
                      endDate: date.endDate === null
                        ? this.context.search.docs[0].date
                        : date.endDate,
                    });
                  }} startDate={this.state.startDate ? new Date(this.state.startDate) : undefined}
                  endDate={this.state.endDate ? new Date(this.state.endDate) : undefined} />} />
                </div>
                <div>
                  <Button className='exportpdf' title='Print result' onClick={() => {
                    window.print();
                  }} />
                </div>
              </div>
          </div>

          <div className = 'result_parameters'>
            <Card>
              <div className='title_param'>Parameters</div>
              <div className='param_card'>
                <Parameteres
                  searchtext={stt(this.context.searchOpts.search.replace(/[^a-zA-Z\s-]/g, ''))
                    .reduce((acc, val) => {
                      if (acc !== '')
                        acc += ', ';
                      if (val.exclude)
                        acc += `-${val.term}`;
                      else if (val.phrase)
                        acc += `"${val.term}"`;
                      else
                        acc += val.term;
                      return acc;
                    }, '')}
                  sentiment={`Emotion: ${this.state.checkedEmotion.length === 0
                    ? 'Joy, Anger, Disgust, Sadness, Fear'
                    : `${this.state.checkedEmotion.slice(0, -1)
                      .map(s => s[0].toUpperCase() + s.slice(1)).join(', ')}${this.state.checkedEmotion.slice(0, -1).length > 0
                      ? ', '
                      : ''}${this.state.checkedEmotion.slice(-1).map(s => s[0].toUpperCase() + s.slice(1))[0]}`}`}
                  timeinterval={`Date Interval: ${new Date(this.state.startDate ? this.state.startDate : filterEmotion[filterEmotion.length - 1].date).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`}
                  amount={`Amount: ${filterEmotion.length}`}
                  emotion={this.context.searchOpts.show}
                  emotionClick={() => {
                    const opts = JSON.parse(JSON.stringify(this.context.searchOpts));
                    opts.show = !opts.show;
                    this.context.computeSearch(this.context.search, opts);
                  }}
                />
              </div>
            </Card>
          </div>

            {this.context.graphData.map((element, i) => {
              const name = classNameMap(element.title);
              return (<div key={i} align="center" className = {`result_graphs_${name} clickable clickable-color`}>
                <Card onClick={() => {
                  if (this.state.checkedEmotion[0] === name
                    && this.state.checkedEmotion.length === 1)
                    return this.setState({ ...this.state, checkedEmotion: [] });
                  this.setState({
                    ...this.state,
                    checkedEmotion: [name],
                  });
                }}>
                  <div className='graphs' >
                    <DonutChart chart={`${name}_chart`} label={`label_${name}`} name={element.title} data={[element]}/>
                  </div>
                </Card>
              </div>);
            })}

          <div className = 'result_graph'>
            <Card>
            <div className='emotionalTone'>Emotional Tone</div>
              <LineChart
                width={350}
                height={300}
                data={this.context.emotionalTone}
                margin={{
                  top: 20,
                }} onClick={(data) => {
                  if (this.state.etSelection) {
                    this.setState({
                      ...this.state,
                      etSelection: false,
                      startDate: undefined,
                      endDate: undefined,
                    });
                    this.dateChange();
                  }
                  else if (data
                    && data.activePayload
                    && data.activePayload[0]
                    && data.activePayload[0].payload
                    && data.activePayload[0].payload.time) {
                    const sd = new Date(data.activePayload[0].payload.time);
                    const ed = new Date(data.activePayload[0].payload.time);
                    sd.setHours(0);
                    sd.setMinutes(0);
                    sd.setSeconds(0);
                    ed.setHours(23);
                    ed.setMinutes(59);
                    ed.setSeconds(59);
                    this.setState({
                      ...this.state,
                      etSelection: true,
                      startDate: sd,
                      endDate: ed,
                    });
                    this.dateChange({
                      startDate: sd,
                      endDate: ed,
                    });
                  }
                }}>
                <XAxis dataKey="date"/>
                <YAxis/>
                <CartesianGrid strokeDasharray="3 3"/>
                <Tooltip/>
                <Legend />
                <Line type="monotone" name="Anger" dataKey="emotions.anger.perc" stroke={coloranger} activeDot={{ r: 8 }}/>
                <Line type="monotone" name="Joy" dataKey="emotions.joy.perc" stroke={colorjoy} />
                <Line type="monotone" name="Fear" dataKey="emotions.fear.perc" stroke={colorfear} />
                <Line type="monotone" name="Sadness" dataKey="emotions.sadness.perc" stroke={colorsad} />
                <Line type="monotone" name="Disgust" dataKey="emotions.disgust.perc" stroke={colordisgust} />
              </LineChart>
            </Card>
          </div>

          <div className = 'result_news'>
            <Card>
            { filterEmotion.length === 0 ? 'No articles found with provided filters' : filterEmotion.map((item, i) => <NewsArticle
              key={i}
              date={new Date(item.date).toLocaleDateString()}
              title={item.headline}
              newssource={item.sourceID}
              domFeeling={item.analysis.emotion ? Object.keys(item.analysis.emotion)
                .sort((a, b) => item.analysis.emotion[b] - item.analysis.emotion[a])[0] : 'None'}
              feelings= {item.analysis.emotion ? item.analysis.emotion : {
                anger: 0, joy: 0, disgust: 0, fear: 0, sadness: 0,
              }}
              onClick= {() => this.makeRedirect(item.url)}
            />) }
            </Card>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

Result.contextType = SearchContext;

export default Result;
