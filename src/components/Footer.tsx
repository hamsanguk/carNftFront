import React from "react";
import styles from "./css/Footer.module.css";
import "./css/iconfont.css"; 

const Footer = () => {
  return (
    <div className={styles.footerWrap}>
      <footer className={styles.footer}>
        <div className={styles.footerT}>
          <ul className={styles.left}>
            <li className={styles.menus}>회사소개</li>
            <li className={styles.menus}>인재채용</li>
            <li className={styles.menus}>클린엔카</li>
            <li className={styles.menus}>지점안내</li>
            <li className={styles.menus}>엔카직영성능점검안내</li>
            <li className={styles.menus}>매매지원</li>
            <li className={styles.menus}>이용약관</li>
            <li className={styles.menus}>고객센터</li>
            <li className={styles.menus}>디스플레이광고</li>
            <li className={styles.menus}>개인정보처리방침</li>
            <li className={styles.menus}>금융소비자보호</li>
            <li className={styles.menus}>원격지원서비스</li>
          </ul>
          <ul className={styles.icons}>
            <li><i className="icon_facebook"></i></li>
            <li><i className="icon_instagram"></i></li>
            <li><i className="icon_youtube"></i></li>
          </ul>
        </div>
        <div className={styles.footerB}>
          <h4>O2O를 잇는 신뢰와 기술로 차량을 사고 파는 모습의 진화를 만듭니다</h4>
          <ul className={styles.comp_infos}>
            <li className={styles.comp_info}>고객센터 : 1599-5455 FAX</li>
            <li className={styles.comp_info}>사업자 등록번호 : 104-86-54476</li>
            <li className={styles.comp_info}>통신판매업신고 : 제2014-서울중구-0393호</li>
            <li className={styles.comp_info}>대표메일 : trust@encar.com</li>
            <li className={styles.comp_info}>주소 : 서울특별시 중구 통일로2길 16, 18~19층(순화동)</li>
            <li className={styles.comp_info}>대표자 : 김상범 Copyright © 엔카닷컴(주)</li>
          </ul>
          <p className={styles.fade_text}>
            <span >
              엔카닷컴(주)는 통신판매중개자로서 통신판매의 당사자가 아니며, 상품·거래정보, 거래에 대하여 책임을 지지 않습니다.
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
