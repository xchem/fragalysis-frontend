import createContactWorker from './createContactWorker';

export default class ContactWorkerClient {
  constructor(createWorker = createContactWorker) {
    this.createWorker = createWorker;
    this.pending = new Map();
    this.sequence = 0;
    this.disposed = false;
  }

  calculate(input) {
    if (this.disposed) return Promise.reject(new Error('Contact worker has been disposed'));
    return new Promise((resolve, reject) => {
      if (!this.resource) {
        this.resource = this.createWorker();
        this.resource.worker.onmessage = ({ data }) => {
          const request = this.pending.get(data.id);
          if (!request) return;
          this.pending.delete(data.id);
          if (data.error) request.reject(new Error(data.error));
          else request.resolve(data.result);
        };
        this.resource.worker.onerror = event => this.stop(new Error(event.message || 'Contact worker failed'));
        this.resource.worker.onmessageerror = () => this.stop(new Error('Unable to read contact worker result'));
      }
      const id = ++this.sequence;
      this.pending.set(id, { resolve, reject });
      try {
        this.resource.worker.postMessage({ id, input });
      } catch (error) {
        this.pending.delete(id);
        reject(error);
      }
    });
  }

  stop(error) {
    this.resource?.worker.terminate();
    this.resource?.release();
    this.resource = null;
    this.pending.forEach(request => request.reject(error));
    this.pending.clear();
  }

  dispose() {
    this.disposed = true;
    this.stop(new Error('Contact worker has been disposed'));
  }
}
