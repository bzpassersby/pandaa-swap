<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->

<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/bzpassersby/pandaa-swap">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Panda Swap</h3>

  <p align="center">
Panda swap provides Panda token rewards for users who stakes in Uniswap liquidity pools. For users to gain Panda rewards, they simply need to stake their LP tokens which prove their share in the liquidity pool.

Note that the current scope of this repo is limited to the back end implementation of the supply and distribution of Panda tokens.

The front end of this project reference SushiSwap and demos the process of LP token staking, Panda rewards distribution and withdrawal.

<br />
<a href="https://dawn-bread-2731.on.fleek.co/" target="_blank">View Demo</a>
·
<a href="https://github.com/bzpassersby/pandaa-swap/issues">Report Bug</a>
·
<a href="https://github.com/bzpassersby/pandaa-swap/issues">Request Feature</a>

  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>

  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![Product Name Screen Shot][product-screenshot]](https://dawn-bread-2731.on.fleek.co/)

## Built With

- Solidity
- Javascript
- React Js
- Ether Js
- Hardhat

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

Below is a list of prerequisite:

- Install [NodeJS](https://nodejs.org/en/), Recommended version is 16.14.2
- Install [MetaMask](https://metamask.io/) in your browser.

## Installation

### 1. Clone/Download the Repository

### 2. Install Dependencies:

`$ npm install `

### 3. Setup .env File

Create a .env file and update the following values. Note `LP_TOKEN_ADDRESS` is the Uniswap LP Token address for DAI/ETH pool on Goerli testnet. `ALLOCATION_POINT` is the weight of a DAI/ETH pool of all liquidity pools. `TOKENS_PER_BLOCK` is the amount of Panda tokens minted per block in ether. `START_BLOCK` and `BONUS_END_BLOCK` determines the start block number of Panda token minting and the end block of bonus reward period, which need to referenced by the latest block number of Goerli testnet.

```sh
ETHERSCAN_API_KEY=""
ALCHEMY_API_KEY=""
DEV_ADDRESS=""
PRIVATE_KEYS=""
LP_TOKEN_ADDRESS=""
ALLOCATION_POINT=
TOKENS_PER_BLOCK=
START_BLOCK=
BONUS_END_BLOCK=
```

### 4. Test Smart Contracts

`$ npx hardhat test`

### 5. Deploy Smart Contracts

`$ npx hardhat deploy --network goerli`

<!-- USAGE EXAMPLES -->

## Usage

Since the front end part of this project is in a separate repo, to interact with the deployed contract, remix IDE can be used to fetch deployed contract user interface.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

bzpassersby - [@bzpassersby](https://twitter.com/bzpassersby) - bowenzby@gmail.com

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/github_username/repo_name.svg?style=for-the-badge
[contributors-url]: https://github.com/github_username/repo_name/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/github_username/repo_name.svg?style=for-the-badge
[forks-url]: https://github.com/github_username/repo_name/network/members
[stars-shield]: https://img.shields.io/github/stars/github_username/repo_name.svg?style=for-the-badge
[stars-url]: https://github.com/github_username/repo_name/stargazers
[issues-shield]: https://img.shields.io/github/issues/github_username/repo_name.svg?style=for-the-badge
[issues-url]: https://github.com/github_username/repo_name/issues
[license-shield]: https://img.shields.io/github/license/github_username/repo_name.svg?style=for-the-badge
[license-url]: https://github.com/github_username/repo_name/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
[next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[next-url]: https://nextjs.org/
[react.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[react-url]: https://reactjs.org/
[vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[vue-url]: https://vuejs.org/
[angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[angular-url]: https://angular.io/
[svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[svelte-url]: https://svelte.dev/
[laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[laravel-url]: https://laravel.com
[bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[bootstrap-url]: https://getbootstrap.com
[jquery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[jquery-url]: https://jquery.com
