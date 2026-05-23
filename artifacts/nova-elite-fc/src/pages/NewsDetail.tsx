import { AppLayout } from "@/components/AppLayout";
import { useGetNewsArticle, getGetNewsArticleQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

export default function NewsDetail() {
  const { id } = useParams();
  const articleId = id ? parseInt(id, 10) : 0;

  const { data: article, isLoading } = useGetNewsArticle(articleId, {
    query: { enabled: !!articleId, queryKey: getGetNewsArticleQueryKey(articleId) }
  });

  if (isLoading) return <AppLayout><div className="pt-32 min-h-screen bg-background text-center text-white">Loading...</div></AppLayout>;
  if (!article) return <AppLayout><div className="pt-32 min-h-screen bg-background text-center text-white">Article not found</div></AppLayout>;

  return (
    <AppLayout>
      <article className="pt-32 pb-20 bg-background min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/news" className="inline-flex items-center text-primary hover:text-white uppercase text-sm font-bold tracking-wider mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to News
          </Link>
          
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <span className="bg-primary text-black px-3 py-1 text-xs font-bold uppercase tracking-wider">{article.category}</span>
              <span className="text-muted-foreground text-sm">{format(new Date(article.createdAt), "MMMM d, yyyy")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white mb-6 leading-tight">
              {article.title}
            </h1>
            {article.author && (
              <div className="text-muted-foreground font-medium">
                By <span className="text-white">{article.author}</span>
              </div>
            )}
          </div>

          {article.imageUrl && (
            <div className="aspect-[21/9] w-full mb-12 overflow-hidden border border-white/10">
              <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:uppercase prose-p:text-gray-300 prose-a:text-primary">
            {article.content.split('\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>
    </AppLayout>
  );
}