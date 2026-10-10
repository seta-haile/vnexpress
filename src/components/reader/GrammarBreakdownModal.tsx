"use client";

import React from "react";
import { 
  Puzzle, 
  X, 
  Sparkles, 
  BookOpen, 
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GrammarBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  sentenceText: string;
}

interface GrammarElement {
  type: string;
  label: string;
  color: string;
  content: string;
  explanation: string;
}

function analyzeSentenceGrammar(sentence: string): GrammarElement[] {
  const elements: GrammarElement[] = [];

  // Identify common connector/clause triggers
  const trimmed = sentence.trim();

  // Simple heuristic NLP decomposition for typical complex sentences
  if (/^(When|While|As|After|Before|Although|Though|Even though|Because|Since|If)\b/i.test(trimmed)) {
    const match = trimmed.match(/^(When|While|As|After|Before|Although|Though|Even though|Because|Since|If)\s+([^,]+),?\s*(.*)$/i);
    if (match) {
      elements.push({
        type: "sub-clause",
        label: "Mệnh đề trạng ngữ (Adverbial Clause)",
        color: "bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300",
        content: `${match[1]} ${match[2]}`,
        explanation: `Mở đầu bằng liên từ chỉ thời gian/điều kiện '${match[1]}' để bổ nghĩa cho mệnh đề chính.`
      });

      if (match[3]) {
        elements.push({
          type: "main-clause",
          label: "Mệnh đề chính (Main Clause)",
          color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
          content: match[3],
          explanation: "Chứa thông điệp và hành động nòng cốt của toàn bộ câu văn."
        });
      }
    }
  }

  // Prepositional phrases finder
  const prepMatches = trimmed.match(/\b(in|at|on|for|with|by|from|to|into|through|about)\s+([A-Z][a-z]+|\w+\s+\w+)/g);
  if (prepMatches && prepMatches.length > 0) {
    elements.push({
      type: "prep-phrase",
      label: "Cụm giới từ (Prepositional Phrases)",
      color: "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300",
      content: prepMatches.slice(0, 3).join(" • "),
      explanation: "Chỉ nơi chốn, thời gian hoặc phương thức thực hiện hành động."
    });
  }

  // Verb tense recognition
  let tenseGuess = "Hiện tại đơn (Present Simple)";
  if (/\b(was|were|had|did|expected|arrived|fought|became|said|found)\b/i.test(trimmed) || /\w+ed\b/i.test(trimmed)) {
    tenseGuess = "Quá khứ đơn (Past Simple) — Kể lại sự việc đã hoàn tất";
  } else if (/\b(have|has)\s+\w+ed\b/i.test(trimmed)) {
    tenseGuess = "Hiện tại hoàn thành (Present Perfect)";
  } else if (/\b(will|shall)\s+\w+\b/i.test(trimmed)) {
    tenseGuess = "Tương lai đơn (Future Simple)";
  }

  elements.push({
    type: "tense",
    label: "Thì & Cấu trúc ngữ pháp (Tense & Form)",
    color: "bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-300",
    content: tenseGuess,
    explanation: "Định hình trục thời gian và thái độ diễn đạt của tác giả bài báo."
  });

  // Relative clauses finder
  if (/\b(which|who|whom|whose|that|where)\b/i.test(trimmed)) {
    elements.push({
      type: "relative-clause",
      label: "Mệnh đề quan hệ (Relative Clause)",
      color: "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300",
      content: "Có đại từ quan hệ (who, which, that, where)",
      explanation: "Giúp nối thêm thông tin chi tiết cho danh từ đứng trước mà không cần tách thành 2 câu rời rạc."
    });
  }

  return elements;
}

export function GrammarBreakdownModal({
  isOpen,
  onClose,
  sentenceText
}: GrammarBreakdownModalProps) {
  if (!isOpen) return null;

  const elements = analyzeSentenceGrammar(sentenceText);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-card border border-border/80 text-card-foreground rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Puzzle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-foreground">
                Mổ xẻ ngữ pháp câu
              </h3>
              <p className="text-xs text-muted-foreground">
                Phân tích cấu trúc câu và các thành phần ngữ pháp chính
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Sentence Box */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
          <span className="text-[11px] font-bold text-muted-foreground block">CÂU GỐC ĐƯỢC PHÂN TÍCH:</span>
          <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed italic">
            "{sentenceText}"
          </p>
        </div>

        {/* Breakdown Elements Cards */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Thành phần cấu trúc câu:</span>
          </span>

          <div className="space-y-2.5">
            {elements.map((el, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border ${el.color} space-y-1.5 transition-all`}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[11px] font-bold border-current/40 bg-background/50">
                    {el.label}
                  </Badge>
                </div>
                <div className="text-xs sm:text-sm font-bold text-foreground">
                  {el.content}
                </div>
                <p className="text-[11px] opacity-80 leading-relaxed">
                  {el.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="rounded-full px-5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
          >
            Đã hiểu
          </Button>
        </div>

      </div>
    </div>
  );
}
