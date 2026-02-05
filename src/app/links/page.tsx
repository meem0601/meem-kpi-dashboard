'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LinkItem {
  id: string;
  title: string;
  url: string;
  category: string;
  icon: string;
  description?: string;
}

const INITIAL_LINKS: LinkItem[] = [
  // 業務ツール
  {
    id: '1',
    title: 'タスク管理',
    url: 'https://www.notion.so/2e8559b71fa28097b09ec8bc5114604f',
    category: '業務ツール',
    icon: '📋',
    description: 'Notionタスク管理データベース',
  },
  {
    id: '2',
    title: 'MTG議事録',
    url: 'https://www.notion.so/2e8559b71fa2808c8b97000b74435c7c',
    category: '業務ツール',
    icon: '📝',
    description: 'MTG議事録一覧',
  },
  // 事業別
  {
    id: '3',
    title: 'Sales管理',
    url: 'https://www.notion.so/',
    category: '事業別',
    icon: '💼',
    description: 'Sales事業の管理画面',
  },
  {
    id: '4',
    title: '不動産AS管理',
    url: 'https://www.notion.so/',
    category: '事業別',
    icon: '🏠',
    description: '不動産ASの案件管理',
  },
  {
    id: '5',
    title: '人材管理',
    url: 'https://www.notion.so/',
    category: '事業別',
    icon: '👥',
    description: '人材事業の管理画面',
  },
  // その他
  {
    id: '6',
    title: 'Google Drive',
    url: 'https://drive.google.com/',
    category: 'その他',
    icon: '📁',
    description: '共有ドライブ',
  },
  {
    id: '7',
    title: 'Slack',
    url: 'https://slack.com/',
    category: 'その他',
    icon: '💬',
    description: 'チームコミュニケーション',
  },
];

const CATEGORIES = ['業務ツール', '事業別', 'その他'];

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  '業務ツール': { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', text: 'text-blue-700' },
  '事業別': { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-700' },
  'その他': { bg: 'from-gray-50 to-slate-50', border: 'border-gray-200', text: 'text-gray-700' },
};

export default function LinksPage() {
  const [links, setLinks] = useState<LinkItem[]>(INITIAL_LINKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    category: '業務ツール',
    icon: '🔗',
    description: '',
  });

  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || link.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedLinks = CATEGORIES.map((category) => ({
    category,
    links: filteredLinks.filter((link) => link.category === category),
  })).filter((group) => group.links.length > 0);

  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) return;

    const link: LinkItem = {
      id: Date.now().toString(),
      ...newLink,
    };

    setLinks((prev) => [...prev, link]);
    setNewLink({
      title: '',
      url: '',
      category: '業務ツール',
      icon: '🔗',
      description: '',
    });
    setIsAddingLink(false);
  };

  const handleDeleteLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* 背景装飾 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-green-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 bg-white/80 backdrop-blur rounded-xl shadow-md border border-gray-100 hover:bg-white transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                🔖 クイックリンク
              </h1>
              <p className="text-sm text-gray-500">よく使うリンクを管理</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddingLink(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            リンクを追加
          </button>
        </div>

        {/* 検索・フィルター */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="リンクを検索..."
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                !selectedCategory
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              すべて
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* リンク一覧 */}
        <div className="space-y-8">
          {groupedLinks.map(({ category, links }) => (
            <div key={category}>
              <h2 className={`text-lg font-bold mb-4 ${categoryColors[category]?.text || 'text-gray-700'}`}>
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className={`group relative bg-gradient-to-br ${categoryColors[link.category]?.bg || 'from-gray-50 to-slate-50'} rounded-xl border ${categoryColors[link.category]?.border || 'border-gray-200'} p-5 hover:shadow-lg transition-all`}
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl group-hover:scale-110 transition-transform">{link.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {link.title}
                          </h3>
                          {link.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{link.description}</p>
                          )}
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </div>
                    </a>
                    {/* 削除ボタン */}
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="削除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredLinks.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">🔍</span>
            <p className="text-lg font-medium text-gray-500">リンクが見つかりません</p>
            <p className="text-sm text-gray-400 mt-1">検索条件を変更してみてください</p>
          </div>
        )}
      </div>

      {/* リンク追加モーダル */}
      {isAddingLink && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsAddingLink(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">リンクを追加</h3>
                <button
                  onClick={() => setIsAddingLink(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">タイトル *</label>
                <input
                  type="text"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  placeholder="リンクのタイトル"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">URL *</label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">カテゴリ</label>
                  <select
                    value={newLink.category}
                    onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">アイコン</label>
                  <input
                    type="text"
                    value={newLink.icon}
                    onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                    placeholder="🔗"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-center text-2xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">説明（任意）</label>
                <textarea
                  value={newLink.description}
                  onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                  placeholder="リンクの説明"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsAddingLink(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddLink}
                disabled={!newLink.title.trim() || !newLink.url.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 font-medium"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
