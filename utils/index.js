/**
 * a 标签下载功能
 * @param {String} URL 下载内容, URL || blob: URL || data: URL(base64)
 * @param {String} name 下载后的文件名称
 */
export const downloadByTagA = ({ URL, name }) => {
  const eleLink = document.createElement('a');
  eleLink.download = name || new Date().getTime();
  eleLink.style.display = 'none';
  eleLink.href = URL;

  document.body.appendChild(eleLink);
  eleLink.click();
  document.body.removeChild(eleLink);
};

/**
 * 下载 blob 文件
 * @param {String} content 下载内容，string || blob
 * @param {String} name 下载后的文件名称
 */
export const downloadBlob = ({ content, name = new Date().getTime() }) => {
  let blob = content;
  if (typeof content === 'string') {
    blob = new Blob([content]);
  }

  // eslint-disable-next-line no-use-before-define
  const URL = URL.createObjectURL(blob);
  downloadByTagA({ URL, name });
};