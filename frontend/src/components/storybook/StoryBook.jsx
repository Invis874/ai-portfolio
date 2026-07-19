import React, { useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import './Book.css';
import { bookPages } from '../../data/bookData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const StoryBook = () => {
  const flipBookRef = useRef(null);

  const nextPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const prevPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  return (
    <div className="book-container">
      <div className="book-shadow">
        <button onClick={prevPage} className="nav-arrow nav-arrow-left">
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </button>

        <HTMLFlipBook
          ref={flipBookRef}
          width={500}
          height={600}
          size="fixed"
          minWidth={320}
          maxWidth={600}
          minHeight={420}
          maxHeight={750}
          drawShadow={true}
          flippingTime={800}
          usePortrait={false}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={0.8}
          showCover={true}
          mobileScrollSupport={true}
          className="custom-html-book"
          style={{
            backgroundColor: 'transparent',
            borderRadius: '4px',
          }}
        >
          {/* ===== ПЕРЕДНЯЯ ОБЛОЖКА ===== */}
          <div className="page book-cover-front" data-density="hard">
            <div className="cover-content">
              <div className="cover-ornament">✦ ✦ ✦</div>
              <h1>📖 AI Automation</h1>
              <div className="cover-subtitle">Портфолио-рассказ</div>
              <div className="cover-divider">━━━━━━━━━━</div>
              <div className="cover-author">Makar Akulenko</div>
              <div className="cover-hint">↻ нажмите на уголок</div>
            </div>
          </div>

          {/* ===== ВНУТРЕННЯЯ СТОРОНА ОБЛОЖКИ ===== */}
          <div className="page book-cover-inner" data-density="soft">
            <div className="cover-inner-content">
              <div className="cover-inner-ornament">✧ ✧ ✧</div>
              <div className="cover-inner-text">«Каждая технология — это заклинание, 
                которое мы накладываем на реальность»</div>
              <div className="cover-inner-author">— Из дневника разработчика</div>
            </div>
          </div>

          {/* ===== ТИТУЛЬНЫЙ ЛИСТ ===== */}
          <div className="page page-title-page" data-density="soft">
            <div className="page-content">
              <div className="title-page-content">
                <div className="title-page-ornament">✦ ✦ ✦</div>
                <h1 className="title-page-main">AI Automation</h1>
                <div className="title-page-sub">Портфолио-рассказ</div>
                <div className="title-page-divider">━━━━━━━━━━</div>
                <div className="title-page-author">Makar Akulenko</div>
                <div className="title-page-year">2026</div>
              </div>
            </div>
          </div>

          {/* Страницы */}
          {bookPages.map((page) => (
            <div
              key={page.id}
              className={`page ${page.type === 'text' ? 'page-text-content' : 'page-gif-content'}`}
              data-density="soft"
            >
              {page.type === 'text' ? (
                <div className="page-content">
                  <div className="page-header">
                    <span className="page-number">{page.chapterIndex + 1}</span>
                  </div>
                  <h2 className="page-title">{page.title}</h2>
                  <h3 className="page-subtitle">{page.subtitle}</h3>
                  <div className="page-description">
                    <div dangerouslySetInnerHTML={{ __html: page.description }} />
                  </div>
                  <div className="page-tech-tags">
                    {page.technologies.map((tech) => (
                      <span key={tech} className="page-tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="page-gif-wrapper">
                  <img
                    src={page.gif}
                    alt={page.title}
                    className="page-gif"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f5ede4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='central' text-anchor='middle' fill='%238a7a6a' font-family='Georgia' font-size='18'%3EДЕМОНСТРАЦИЯ%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </HTMLFlipBook>

        <button onClick={nextPage} className="nav-arrow nav-arrow-right">
          <FontAwesomeIcon icon={faArrowRight} size="lg" />
        </button>
      </div>
    </div>
  );
};

export default StoryBook;