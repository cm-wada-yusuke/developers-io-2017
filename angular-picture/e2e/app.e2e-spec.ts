import { AngularPicturePage } from './app.po';

describe('angular-picture App', () => {
  let page: AngularPicturePage;

  beforeEach(() => {
    page = new AngularPicturePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
