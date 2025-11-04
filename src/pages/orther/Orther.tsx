import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import 'katex/dist/katex.min.css';

function convertLatexDelimiters(text: string) {
  if (typeof text !== 'string') return text;

  // Convert block math \[ ... \] → $$ ... $$
  text = text.replace(/\\\[(.*?)\\\]/gs, '$$$$ $1 $$$$');

  // Convert inline math \( ... \) → $ ... $
  text = text.replace(/\\\((.*?)\\\)/gs, '\$ $1 \$');

  return text;
}

export default function ChartWithTrendlines() {
  const text = `Để áp dụng công thức EMA (Exponential Moving Average) vào 20 cây nến, bạn cần thực hiện các bước sau:\n\n1. **Chọn chu kỳ EMA**: Trong trường hợp này, chu kỳ là 20, vì bạn muốn tính EMA cho 20 cây nến.\n\n2. **Tính toán hệ số làm mượt (smoothing factor)**: Hệ số này được tính bằng công thức:\n   \\[\n   \\text{Smoothing Factor} = \\frac{2}{N + 1}\n   \\]\n   Trong đó \\(N\\) là chu kỳ (20 trong trường hợp này). Vậy hệ số sẽ là:\n   \\[\n   \\text{Smoothing Factor} = \\frac{2}{20 + 1} = \\frac{2}{21} \\approx 0.0952\n   \\]\n\n3. **Khởi tạo EMA**: Để tính EMA, bạn cần một giá trị khởi tạo. Thông thường, giá trị khởi tạo có thể là giá trung bình của 20 cây nến đầu tiên (SMA - Simple Moving Average).\n\n4. **Tính EMA cho từng cây nến**: Sau khi có giá trị khởi tạo, bạn có thể tính EMA cho từng cây nến tiếp theo bằng công thức:\n   \\[\n   \\text{EMA}_{\\text{current}} = (\\text{Close}_{\\text{current}} \\times \\text{Smoothing Factor}) + (\\text{EMA}_{\\text{previous}} \\times (1 - \\text{Smoothing Factor}))\n   \\]\n   Trong đó:\n   - \\(\\text{Close}_{\\text{current}}\\) là giá đóng cửa của cây nến hiện tại.\n   - \\(\\text{EMA}_{\\text{previous}}\\) là giá trị EMA của cây nến trước đó.\n\n5. **Lặp lại**: Tiếp tục lặp lại bước 4 cho tất cả các cây nến trong dữ liệu của bạn.\n\nBằng cách này, bạn sẽ có được giá trị EMA cho 20 cây nến.`
  const html = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .processSync(convertLatexDelimiters(text))
    .toString();

  return (
    <div
      className="ai-text"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
