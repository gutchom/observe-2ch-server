import 'colors'
import http from 'http'
import moment from 'moment'
import cheerio from 'cheerio'
import { TextDecoder } from 'text-encoding'
import Board from 'models/Board'
import Thread from 'models/Thread'
import Post from 'models/Post'

moment.locale('ja')

const messageLabel = {
  info: ' info '.white.inverse,
  done: ' done '.cyan.inverse,
  fail: ' fail '.yellow.inverse,
  exit: ' exit '.green.inverse,
}

export interface PostData {
  number: number
  name: string
  uid: string
  timestamp: Date
  message: string
  url: string
}

export interface ThreadData {
  title: string
  url: string
  res: number
  position: number
}

export interface BBSCache {
  fetch(): Promise<void>
}

export default class Cache implements BBSCache {
  url: string
  boardName: string
  threadList: ThreadData[]

  constructor(url: string) {
    this.url = url[url.length - 1] === '/' ? url.slice(0, -1) : url
    this.boardName = (url.match(/\.net.*\/(.+?)\/?$/) as string[])[1]
  }

  async fetch(): Promise<void> {
    return Board
      .findOrCreate<Board>({
        where: {url: this.url},
        defaults: {url: this.url}
      })
      .spread(async (board: Board, created) => {
        if (created) {
          await this.getBoard(board)
        } else {
          await this.getBoardDiff(board)
        }

        console.log(`${messageLabel.exit} scraped "${this.boardName}"`)
      })
  }

  getHtml(url: string, encode = 'utf8'): Promise<string> {
    return new Promise(resolve => {
      http.get(url, res => {
        const buffers: Buffer[] = []
        res.on('data', (chunk: Buffer) => buffers.push(new Buffer(chunk)))
        res.on('end', () => {
          const decoder = new TextDecoder(encode)
          const html = decoder.decode(Buffer.concat(buffers)) as string
          resolve(html)
        })
      })
    })
  }

  async getThreadLists(): Promise<ThreadData[]> {
    let html
    try {
      html = await this.getHtml(this.url + '/subback.html', 'shift_jis')
    } catch (err) {
      throw err
    }
    const $ = cheerio.load(html)

    return $('#trad > a').get()
      .map(el => {
        const id = $(el).attr('href').slice(0, -4)
        const [, position, title, res] = $(el).text()
          .replace(/\s\[(?:無断)?転載禁止]©\dch\.net\s/g, '')
          .match(/(\d+):(.*)\((\d+)\)/) || [, '0', '', '0']

        return {
          title: title || '',
          url: this.url.replace(/\.net/, '.net/test/read.cgi') + id,
          res: parseInt(res || '0', 10),
          position: parseInt(position || '0', 10),
        }
      })
  }

  async getPosts(url: string, start = 0): Promise<PostData[]> {
    url = start > 0 ? `${url}/${start}-` : url
    let html
    try {
      html = await this.getHtml(url, 'shift_jis')
    } catch (err) {
      throw err
    }
    const $ = cheerio.load(html)

    return $('.thread > .post').get()
      .map(post => {
        const $meta = $(post).children('div.meta')
        const number = $meta.children('span.number').text().replace(/^0*/, '')

        return {
          number: parseInt(number, 10),
          name: $meta.children('span.name').text(),
          timestamp: moment($meta.children('span.date').text(), 'YYYY/MM/DD(ddd) HH:mm:ss.SS').toDate(),
          uid: $meta.children('span.uid').text(),
          message: $(post).children('div.message').text(),
          url: url.replace(/\.net/, '.net/test/read.cgi') + '/' + number,
        }
      })
      .slice(start > 0 ? 1 : 0)
  }

  async getBoard(board: Board): Promise<void> {
    this.threadList = await this.getThreadLists()

    console.log(`${messageLabel.info} downloading: ${this.threadList.length} threads`)

    return this.threadList
      .reduce(async (promise: Promise<PostData[]>, thread: ThreadData, index: number) => {
        const record = new Thread(Object.assign({}, thread, { boardId: board.id }))

        const [posts] = await Promise.all([promise, record.save()])
        await Post.bulkCreate<Post>(posts.map(async post =>
          Object.assign({}, post, {threadId: record.id, thread: record})
        ))
        console.log(`${messageLabel.done} download: ${index}/${this.threadList.length} threads`)

        return this.getPosts(thread.url)
      }, this.getPosts(this.threadList[0].url))
      .then(async promise => {
        const record = new Thread(Object.assign({}, this.threadList[this.threadList.length - 1], { boardId: board.id }))

        const [posts] = await Promise.all([promise, record.save()])
        await Post.bulkCreate<Post>(posts.map(async post =>
          Object.assign({}, post, {threadId: record.id, thread: record})
        ))
        console.log(`${messageLabel.done} download: ${this.threadList.length}/${this.threadList.length} threads`)
      })
  }

  async getBoard(board: Board): Promise<void> {
    this.threadList = await this.getThreadLists()

    const threads = await board.$get('threads') as Thread[]

    const dropped = threads.filter((record: Thread) => this.threadList.findIndex(thread => thread.url === record.url) === -1)
    const created = this.threadList.filter(thread => threads.findIndex((record: Thread) => thread.url === record.url) === -1)
    const updated = this.threadList.filter(thread => threads.findIndex((record: Thread) => thread.url === record.url) !== -1)

    console.log(`${messageLabel.info} dropping: ${dropped.length} threads`)
    console.log(`${messageLabel.info} creating: ${created.length} threads`)
    console.log(`${messageLabel.info} updating: ${updated.length} threads`)

    dropped.forEach(record => record.destroy())
    console.log(`${messageLabel.done} dropped: ${dropped.length} threads`)

    await created
      .reduce(async (promise: Promise<PostData[]>, thread: ThreadData, index: number) => {
        const record = new Thread(Object.assign({}, thread, { boardId: board.id }))

        const [posts] = await Promise.all([promise, record.save()])
        await Post.bulkCreate<Post>(posts.map(async post =>
          Object.assign({}, post, {threadId: record.id, thread: record})
        ))
        console.log(`${messageLabel.done} download: ${index}/${created.length} threads`)

        return this.getPosts(thread.url)
      }, this.getPosts(this.threadList[0].url))
      .then(async promise => {
        const record = new Thread(Object.assign({}, this.threadList[this.threadList.length - 1], { boardId: board.id }))

        const [posts] = await Promise.all([promise, record.save()])
        await Post.bulkCreate<Post>(posts.map(async post =>
          Object.assign({}, post, {threadId: record.id, thread: record})
        ))
        console.log(`${messageLabel.done} download: ${created.length}/${created.length} threads`)
      })

    return updated
      .reduce(async (promise: Promise<PostData[]>, thread: ThreadData, index: number) => {
        const record = await Thread.findOne<Thread>({where: {url: thread.url}}) as Thread

        const posts = await promise
        await Promise.all(posts.map(async post =>
          record.$create('posts', Object.assign({}, post, {threadId: record.id, thread: record}))
        ))
        console.log(`${messageLabel.done} download: ${index}/${updated.length} threads`)

        return this.getPosts(thread.url, thread.res)
      }, this.getPosts(this.threadList[0].url, this.threadList[0].res))
      .then(async promise => {
        const record = await Thread.findOne<Thread>({where: {url: this.threadList[this.threadList.length - 1].url}}) as Thread

        const posts = await promise
        await Promise.all(posts.map(async post =>
          record.$create('posts', Object.assign({}, post, {threadId: record.id, thread: record}))
        ))
        console.log(`${messageLabel.done} download: ${updated.length}/${updated.length} threads`)
      })
  }
}
