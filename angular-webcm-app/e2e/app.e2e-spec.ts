import { AngularWebcmAppPage } from './app.po';

describe('angular-webcm-app App', () => {
  let page: AngularWebcmAppPage;

  beforeEach(() => {
    page = new AngularWebcmAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
