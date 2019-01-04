import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
  @font-face {
    font-family: 'Interface';
    font-style:  normal;
    font-weight: 400;
    src: url("/fonts/Interface-Regular.woff2") format("woff2"),
         url("/fonts/Interface-Regular.woff") format("woff");
  }

  @font-face {
    font-family: 'Interface';
    font-style:  normal;
    font-weight: 500;
    src: url("/fonts/Interface-Medium.woff2") format("woff2"),
         url("/fonts/Interface-Medium.woff") format("woff");
  }

  @font-face {
    font-family: 'Interface';
    font-style:  normal;
    font-weight: 700;
    src: url("/fonts/Interface-Bold.woff2") format("woff2"),
         url("/fonts/Interface-Bold.woff") format("woff");
  }

  html,
  body,
  #root {
    height: 100%;
  }

  body {
    font-family: "Interface", sans-serif;
    margin: 0;
    background-color: var(--gray6);

    --accent_color: #2196f3;

    --gray1: #464646;
    --gray2: #636363;
    --gray3: #777;
    --gray4: #bdbdbd;
    --gray5: #ebebeb;
    --gray6: #f8f8f8;
    --gray7: #fefefe;

    --hearty: #d81b60;
    --friendly: #1bb518;

    &.dark {
      --accent_color: #8dccff;

      --gray7: #212121;
      --gray6: #313131;
      --gray5: #383838;
      --gray4: #525252;
      --gray3: #8a8a8a;
      --gray2: #bdbdbd;
      --gray1: #d4d4d4;

      --hearty: #c15c81;
      --friendly: #4a9448;
    }
  }

  #get-a-proper-browser {
    display: none;
    padding: 1em;
  }

  a:link,
  a:visited,
  a:active,
  a:hover {
    text-decoration: none;
    color: var(--accent_color);
  }
`;
