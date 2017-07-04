import { AngularGstreamAppPage } from './app.po';

describe('angular-gstream-app App', () => {
  let page: AngularGstreamAppPage;

  beforeEach(() => {
    page = new AngularGstreamAppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
