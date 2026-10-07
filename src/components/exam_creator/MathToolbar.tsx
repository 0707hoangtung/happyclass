import React from 'react';
import { Sparkles, Image, Table, HelpCircle } from 'lucide-react';

interface MathToolbarProps {
  onInsert: (snippet: string) => void;
}

export const MathToolbar: React.FC<MathToolbarProps> = ({ onInsert }) => {
  const mathSymbols = [
    { label: 'a/b', snippet: '$\\frac{a}{b}$', title: 'Phân số' },
    { label: '√x', snippet: '$\\sqrt{x}$', title: 'Căn bậc hai' },
    { label: 'x²', snippet: '$x^{2}$', title: 'Lũy thừa' },
    { label: 'x₁', snippet: '$x_{1}$', title: 'Chỉ số dưới' },
    { label: 'a⃗', snippet: '$\\vec{a}$', title: 'Vectơ' },
    { label: 'Δ', snippet: '$\\Delta$', title: 'Delta' },
    { label: 'π', snippet: '$\\pi$', title: 'Số Pi' },
    { label: 'α', snippet: '$\\alpha$', title: 'Alpha' },
    { label: 'β', snippet: '$\\beta$', title: 'Beta' },
    { label: '±', snippet: '$\\pm$', title: 'Cộng trừ' },
    { label: '≤', snippet: '$\\le$', title: 'Nhỏ hơn hoặc bằng' },
    { label: '≥', snippet: '$\\ge$', title: 'Lớn hơn hoặc bằng' },
    { label: '≠', snippet: '$\\ne$', title: 'Khác' },
    { label: '∈', snippet: '$\\in$', title: 'Thuộc' },
    { label: '∉', snippet: '$\\notin$', title: 'Không thuộc' },
    { label: '⊂', snippet: '$\\subset$', title: 'Tập con' },
    { label: '∪', snippet: '$\\cup$', title: 'Hợp' },
    { label: '∩', snippet: '$\\cap$', title: 'Giao' },
    { label: '∞', snippet: '$\\infty$', title: 'Vô cực' },
    { label: '∫', snippet: '$\\int_{a}^{b} f(x) dx$', title: 'Tích phân' },
    { label: 'lim', snippet: '$\\lim_{x \\to 0} f(x)$', title: 'Giới hạn' },
    { label: '{ Hệ PT', snippet: '$$\\begin{cases} x + y = 2 \\\\ 2x - y = 1 \\end{cases}$$', title: 'Hệ phương trình' },
  ];

  const templateSnippets = [
    {
      label: 'Bảng biến thiên mẫu',
      snippet: `$$\\begin{array}{|c|ccccc|}
\\hline
x & -\\infty & & 0 & & +\\infty \\\\
\\hline
y' & & + & 0 & - & \\\\
\\hline
& & & 2 & & \\\\
y & & \\nearrow & & \\searrow & \\\\
& -\\infty & & & & -\\infty \\\\
\\hline
\\end{array}$$`,
      title: 'Bảng biến thiên hàm số mẫu',
    },
    {
      label: 'Bảng số liệu thống kê',
      snippet: `$$\\begin{array}{|c|c|c|c|c|}
\\hline
\\text{Giá trị } (x_i) & 5 & 6 & 7 & 8 \\\\
\\hline
\\text{Tần số } (n_i) & 4 & 12 & 15 & 9 \\\\
\\hline
\\end{array}$$`,
      title: 'Bảng phân bố tần số',
    },
  ];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Chèn nhanh công thức toán học (Latex / KaTeX):</span>
        </span>
        <span className="text-[11px] text-slate-400">Bấm nút để chèn vào vị trí con trỏ</span>
      </div>

      <div className="flex flex-wrap gap-1.5 items-center">
        {mathSymbols.map((item, idx) => (
          <button
            key={idx}
            type="button"
            title={item.title}
            onClick={() => onInsert(item.snippet)}
            className="px-2 py-1 bg-white hover:bg-rose-50 hover:text-rose-900 border border-slate-200 rounded-lg text-slate-700 font-medium transition-colors shadow-2xs cursor-pointer text-xs"
          >
            {item.label}
          </button>
        ))}

        {templateSnippets.map((tpl, idx) => (
          <button
            key={`tpl-${idx}`}
            type="button"
            title={tpl.title}
            onClick={() => onInsert('\n' + tpl.snippet + '\n')}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-semibold transition-colors shadow-2xs cursor-pointer flex items-center gap-1 text-[11px]"
          >
            <Table className="w-3 h-3 text-amber-700" />
            <span>{tpl.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
