import { GetStaticProps } from 'next'
import Header from '../../components/Header'
import { sanityClient, urlFor } from '../../sanity'
import { Post } from '../../typings'

interface Props {
  post: Post
}

const Post = ({ post }: Props) => {
  return (
    <main>
      <Header></Header>
      <img
        className="h-40 w-full object-cover"
        src={urlFor(post.mainImage).url()!}
        alt=""
      />

      <article className="ml-auto max-w-3xl p-5">
        <h1 className="mt-10 mb-3 text-3xl">{post.title}</h1>
        <h2 className="mb-2 text-xl font-light text-gray-500">
          {post.description}
        </h2>
      </article>

      <div className="flec items-center space-x-2">
        <img
          className="h-10 rounded-full"
          src={urlFor(post.author.image).url()!}
          alt=""
        />
        <p className="tect-sm font-extralight">
          {' '}
          Blogpost by {post.author.name} - Published at{' '}
          {new Date(post._createdAt).toLocaleString()}
        </p>
      </div>
    </main>
  )
}

export default Post

export const getStaticPaths = async () => {
  const query = `*[_type=="post"]{
        _id,slug{
            current
        }
    }`

  const posts = await sanityClient.fetch(query)

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type=="post" && slug.current ==[slug][0]]{
        _id,
        _createdAt,
        title,
        author->{
            name,
            image
        },
        'comments':*[
            _type=="comment" &&
            post.ref == ^._id &&
            approved ==true],
        description,
        mainImage,
        slug,
        body
        
    }`

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  })

  if (!post) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      post,
    },
    revalidate: 60, // implementation of ISR(static page). caches the page in every 60 seconds
  }
}
