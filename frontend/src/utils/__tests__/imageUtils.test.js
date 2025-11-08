import resizeImage from "../imageUtils";

describe("resizeImage", () => {
  beforeEach(() => {
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => "blob:dummy");

    // Mock Image behaviour: when src set, call onload and set width/height
    function MockImage() {
      this._src = '';
      this.onload = null;
      this.onerror = null;
      this.width = 800;
      this.height = 600;
      Object.defineProperty(this, 'src', {
        set: (v) => {
          this._src = v;
          // simulate async load
          if (this.onload) setTimeout(() => this.onload(), 0);
        },
        get: () => this._src
      });
    }
    global.Image = MockImage;

    // Mock canvas
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: () => ({
        drawImage: jest.fn()
      }),
      toBlob: (cb) => cb(new Blob(["dummy"], { type: "image/jpeg" }))
    };
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') return mockCanvas;
      return document.createElement(tag);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.Image;
  });

  it('returns a Blob when given a file', async () => {
    const fakeFile = new File(["data"], 'test.png', { type: 'image/png' });
    const blob = await resizeImage(fakeFile, 200, 200);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/jpeg');
  });
});
