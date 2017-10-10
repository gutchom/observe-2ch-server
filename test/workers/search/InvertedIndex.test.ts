import * as assert from 'power-assert'
import InvertedIndex from '../../../src/workers/search/InvertedIndex'

describe('InvertedIndex.ts', function() {
  it('should list up occurrence location', function() {
    const text = '今日は大雨だったけど明日は快晴になるらしい。'
    const index = new InvertedIndex('0', text)

    assert.equal(index.all.reduce((summary, { locations }) => summary + locations.length, 0), text.length - 1)
    assert.equal(index.all.length, text.length - 2)
  })

  it('should detect substring locations', function() {
    const text = '今日は大雨だったけど明日は快晴になるらしい。'
    const index = new InvertedIndex('0', text)

    assert.deepEqual(index.locations('日は'), [
      { document: '0', position: 1 },
      { document: '0', position: 11 },
    ])
  })

  it('should detect substring locations after merge', function() {
    const texts = [
      '今日は大雨だったけど明日は快晴になるらしい。',
      '明日は洗濯日和になりそうだね。',
    ]
    const index = texts
      .map((text, id) => new InvertedIndex(id.toString(10), text))
      .reduce((pre, now) => pre.merge(now.all))

    assert.deepEqual(index.locations('日は'), [
      { document: '1', position: 1 },
      { document: '0', position: 1 },
      { document: '0', position: 11 },
    ])
  })
})
