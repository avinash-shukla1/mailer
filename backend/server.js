import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import Member from './models/Member.js';
import SliderImage from './models/SliderImage.js';
// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import models (update these paths according to your project structure)
import Media from './models/Media.js';
import History from './models/History.js';
import Youtube from './models/Youtube.js';
import CardRoom from './models/CardRoom.js';
import Photo from './models/Photo.js';
import Constitution from './models/Constitution.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5200;
let authRoutes;
try {
  authRoutes = await import('./routes/authRoutes.js');
  authRoutes = authRoutes.default; // Access the default export
} catch (error) {
  console.error('Error importing authRoutes:', error);
  // Handle the error appropriately, e.g., exit the process or use a default route
  process.exit(1); // Exit the process if authRoutes is critical
}
// Set strictQuery to false to prepare for Mongoose 7
mongoose.set('strictQuery', false);

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/aipp_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Seed Card Room data if collection is empty
  try {
    const count = await CardRoom.countDocuments();
    if (count === 0) {
      const initialCardRoomData = [
        {
          imageSrc: 'https://i.pinimg.com/736x/3c/d1/7b/3cd17b086cd1072655f9471183f8a46b.jpg',
          name: 'S. Mahatma Gandhi',
          description: 'ब्रिटिश शासित भारत में भारतीय स्वतंत्रता आंदोलन के महान नेता.',
          description2: 'Great leader of Indian independence movement in British-ruled India.'
        },
        {
          imageSrc: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNWAEcUIUT83KGeTNulQROk4IUdmhPhGPUvA&s',
          name: 'S. Balwant Rai Mehta ',
          description: 'त्रिस्तरीय पंचायतीराज के स्रष्टा-संस्थापक अध्यक्ष',
          description2: 'Founding president of the creator-tier Panchayati Raj'
        },
        {
          imageSrc: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3xqM5mchwh4C0PGenOEg04M8yowOBtvKYZmuC-QzCgt-5dei-117m-4tHy9uei3QPLuI&usqp=CAU',
          name: 'S. Bharat Ratna Loknayak',
          description: 'स्वतंत्रता संग्राम के अमर सेनानी, पूर्व अध्यक्ष',
          description2: 'The immortal freedom fighter. ex. President of AIPP.'
        }
        // Add other initial card room data as needed
      ];

      await CardRoom.insertMany(initialCardRoomData);
      console.log('Card Room data seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding Card Room data:', error);
  }
})
.catch(err => console.error('MongoDB connection error:', err));

// Create necessary directories if they don't exist
const uploadDirs = {
  constitutionPdfs: path.join(__dirname, 'uploads/ConstitutionPdfs'),
  historyPdfs: path.join(__dirname, 'uploads/HistoryPdfs'),
  images: path.join(__dirname, 'uploads/images'),
  mediaNews: path.join(__dirname, 'uploads/mediaNews'),
  albums: path.join(__dirname, 'uploads/albums')
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer configuration for handling file uploads
const storage = multer.memoryStorage(); // This will store files in memory
const upload = multer({ storage: storage });

// Enable CORS and static file serving
app.use(cors({
  origin: 'http://localhost:5173' // Or '*' to allow all origins (not recommended for production)
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log("Middleware working fine");
  next();
});
// Add or update the static file serving middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);

let mediaItems = [
  {
    id: 1,
    title: "Media Headline 1",
    description: "A short description for media content item 1.",
    imageUrl: "https://via.placeholder.com/400x300?text=Media+1",
    newsUrl: "https://example.com/news1",
    socialLinks: {
      twitter: "",
      facebook: "",
      instagram: ""
    }
  },
  {
    id: 2,
    title: "Media Headline 2",
    description: "A short description for media content item 2.",
    imageUrl: "https://via.placeholder.com/400x300?text=Media+2",
    newsUrl: "https://example.com/news2",
  },
];

let youtubeVideos = [
  {
    id: 1,
    title: "YouTube Video 1",
    embedUrl: "https://www.youtube.com/embed/VIDEO_ID1",
  },
  {
    id: 2,
    title: "YouTube Video 2",
    embedUrl: "https://www.youtube.com/embed/VIDEO_ID2",
  },
];

let pdfFiles = [
    { name: "Constitution Of AIPP", url: "/ConstitutionPdfs/constitution_eng.pdf" },
    { name: "AIPP का गठन ", url: "/ConstitutionPdfs/constitution_hin.pdf" },
    { name: "List of subjects covered in the 11th Schedule of the Indian Constitution", url: "/ConstitutionPdfs/Constitution1.pdf" },
    { name: "भारतीय संविधान की 11वीं अनुसूची में शामिल विषयों की सूची", url: "/ConstitutionPdfs/Constitution2.pdf" },
    { name: "List of subjects covered in the 12th Schedule of the Indian Constitution", url: "/ConstitutionPdfs/hindi11.pdf" },
    { name: "भारतीय संविधान की 12वीं अनुसूची में शामिल विषयों की सूची", url: "/ConstitutionPdfs/hindi22.pdf" },  
];

let historyItems = [
  {
    name: "Sh. Guljari Lal Nanda",
    description: "Sh. Gulzari Lal Nanda, interim Prime Minister of India, led the country after Nehru's death, showcasing leadership during the challenging period of transition in 1964.",
    imageUrl: "/images/HISTORY/Gulzarilal-Nand.webp",
    pdfUrl: ""
  },
  {
    name: "Sh. Jawahar Lal Nehru",
    description: "Sh. Jawahar Lal Nehru, India's first Prime Minister, delivered his iconic speech on India's independence, emphasizing unity, progress, and the responsibility of the nation.",
    imageUrl: "/images/HISTORY/512px-Jnehru.webp",
    pdfUrl: ""
  },
  {
    name: "Smt. Indira Gandhi",
    description: "Inaugural speech of Smt. Indira Gandhi, Prime Minister of India, delivered on the occasion of the 12th National Con- ference of AIPP held at Gandhinagar, Gujarat on 26th and 27th May, 1983.",
    imageUrl: "/images/HISTORY/indian-politician-indira-gandhi.webp",
    pdfUrl: "/Pdfs/indira.pdf"
  },
  {
    name: "Sh. V.V. Giri",
    description: "Speech by Shri V.V. Giri, President of India on the occasion of laying of the Foundation Stone of the Balwantray Mehta Panchayat Raj Bhawan, Patparganj, Delhi.",
    imageUrl: "/images/HISTORY/vv.jpg",
    pdfUrl: "/Pdfs/vvgiri.pdf"
  },
  // Add more history items as needed
];

let cardRoomData = [
  {
    imageSrc: 'https://i.pinimg.com/736x/3c/d1/7b/3cd17b086cd1072655f9471183f8a46b.jpg',
    name: 'S. Mahatma Gandhi',
    description: 'ब्रिटिश शासित भारत में भारतीय स्वतंत्रता आंदोलन के महान नेता.',
    description2: 'Great leader of Indian independence movement in British-ruled India.'
  },
  {
    imageSrc: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNWAEcUIUT83KGeTNulQROk4IUdmhPhGPUvA&s',
    name: 'S. Balwant Rai Mehta ',
    description: 'त्रिस्तरीय पंचायतीराज के स्रष्टा-संस्थापक अध्यक्ष',
     description2: 'Founding president of the creator-tier Panchayati Raj' 
  },
  {
    imageSrc: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3xqM5mchwh4C0PGenOEg04M8yowOBtvKYZmuC-QzCgt-5dei-117m-4tHy9uei3QPLuI&usqp=CAU',
    name: 'S. Bharat Ratna Loknayak',
    description: 'स्वतंत्रता संग्राम के अमर सेनानी, पूर्व अध्यक्ष',
     description2: 'The immortal freedom fighter. ex. President of AIPP.'
  },
  {
    imageSrc: '/images/HOME/image1.jpeg',
    name: 'Sh. Ashok Jadon',
    description: 'राष्ट्रीय अध्यक्ष अखिल भारतीय पंचायत परिषद दिल्ली',
     description2: 'All India Panchayat Parishad, Delhi'
  },
  {
    imageSrc: '/images/HOME/image2.jpeg',
    name: 'Sh. Sheetla Shankar Vijay Mishra',
    description: 'मुख्य mantri अखिल भारतीय पंचायत परिषद दिल्ली',
     description2: 'Chief General Secretary All India Panchayat Parishad, Delhi'
  },
  {
    imageSrc: '/images/HOME/image3.jpeg',
    name: 'Sh. Ashok Singh Sengar',
    description: 'मध्यप्रदेश राज्य पंचायत परिषद म . प्र .',
     description2: 'Madhya Pradesh State Panchayat Parishad, M.P.'
  },
  // Your card data here
  // ...other card data...
];

let ourMemberData = [
  {
    imageSrc: 'https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png',
    name: 'name',
    description: 'Working President',
    description2: 'All India Panchayat Parishad'
  },
  
  // ...other member data...
];

const getNextId = (items) => {
  return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
};


app.get("/test", (req, res) => {
  res.send("Test route working!");
});

app.get('/api/media-items', async (req, res) => {
  try {
    const mediaItems = await Media.find().sort({ createdAt: -1 });
    
    // Convert Buffer data to base64 strings with null checks
    const processedItems = mediaItems.map(item => {
      try {
        return {
          _id: item._id,
          title: item.title,
          description: item.description,
          imageSrc: item.image && item.image.data && item.image.contentType
            ? `data:${item.image.contentType};base64,${item.image.data.toString('base64')}`
            : null,
          newsUrl: item.newsUrl,
          socialLinks: item.socialLinks || {},
          createdAt: item.createdAt
        };
      } catch (err) {
        console.error('Error processing item:', err, item);
        return null;
      }
    }).filter(item => item !== null); // Remove any failed items

    res.json(processedItems);
  } catch (error) {
    console.error('Error fetching media items:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/youtube-videos', async (req, res) => {
  try {
    const videos = await Youtube.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/pdf-files', (req, res) => {
  res.json(pdfFiles);
});

app.get('/api/history-items', async (req, res) => {
  try {
    const items = await History.find().sort({ createdAt: -1 });
    const processedItems = items.map(item => {
      try {
        return {
          _id: item._id,
          name: item.name,
          description: item.description,
          imageUrl: item.image && item.image.data && item.image.contentType
            ? `data:${item.image.contentType};base64,${item.image.data.toString('base64')}`
            : null,
          pdfUrl: item.pdf && item.pdf.data
            ? `/api/history/pdf/${item._id}`
            : null,
          createdAt: item.createdAt
        };
      } catch (err) {
        console.error('Error processing item:', err);
        return null;
      }
    }).filter(item => item !== null); // Remove any null items

    res.json(processedItems);
  } catch (error) {
    console.error('Error fetching history items:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/card-room-data', (req, res) => {
  res.json(cardRoomData);
});

app.get('/api/our-member-data', (req, res) => {
  res.json(ourMemberData);
});

app.post('/api/media-items', upload.single('mediaImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Validate required fields
    if (!req.body.title || !req.body.description || !req.body.newsUrl) {
      return res.status(400).json({ message: 'Title, description and news URL are required' });
    }

    const mediaItem = new Media({
      title: req.body.title,
      description: req.body.description,
      newsUrl: req.body.newsUrl,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      },
      socialLinks: {
        twitter: req.body.twitterUrl || '',
        facebook: req.body.facebookUrl || '',
        instagram: req.body.instagramUrl || ''
      }
    });

    const savedItem = await mediaItem.save();
    
    // Process the saved item for response with null checks
    const processedItem = {
      _id: savedItem._id,
      title: savedItem.title,
      description: savedItem.description,
      imageSrc: savedItem.image && savedItem.image.data && savedItem.image.contentType
        ? `data:${savedItem.image.contentType};base64,${savedItem.image.data.toString('base64')}`
        : null,
      newsUrl: savedItem.newsUrl,
      socialLinks: savedItem.socialLinks || {},
      createdAt: savedItem.createdAt
    };

    res.status(201).json(processedItem);
  } catch (error) {
    console.error('Error creating media item:', error);
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/youtube-videos', async (req, res) => {
  try {
    const newVideo = new Youtube(req.body);
    const savedVideo = await newVideo.save();
    res.status(201).json(savedVideo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/history-items', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'historyPdf', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Received files:', req.files); // Debug log
    console.log('Received body:', req.body); // Debug log

    if (!req.files) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const historyItem = new History({
      name: req.body.name,
      description: req.body.description,
      image: req.files.image ? {
        data: req.files.image[0].buffer,
        contentType: req.files.image[0].mimetype
      } : null,
      pdf: req.files.historyPdf ? {
        data: req.files.historyPdf[0].buffer,
        contentType: req.files.historyPdf[0].mimetype
      } : null
    });

    const savedItem = await historyItem.save();
    console.log('Saved item:', savedItem); // Debug log

    const processedItem = {
      _id: savedItem._id,
      name: savedItem.name,
      description: savedItem.description,
      imageUrl: savedItem.image ? `data:${savedItem.image.contentType};base64,${savedItem.image.data.toString('base64')}` : null,
      pdfUrl: savedItem.pdf ? `/api/history/pdf/${savedItem._id}` : null,
      createdAt: savedItem.createdAt
    };

    res.status(201).json(processedItem);
  } catch (error) {
    console.error('Error creating history item:', error);
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/pdf-files', upload.single('pdf'), (req, res) => {
  try {
    let pdfUrl;
    if (req.file) {
      pdfUrl = `http://localhost:${PORT}/uploads/pdfs/${req.file.filename}`;
    } else if (req.body.pdfUrl) {
      pdfUrl = req.body.pdfUrl;
    } else {
      return res.status(400).json({ message: 'No PDF provided' });
    }

    const newPdf = {
      name: req.body.name,
      url: pdfUrl
    };
    
    pdfFiles.push(newPdf);
    res.status(201).json(newPdf);
  } catch (error) {
    console.error('Error in pdf upload:', error);
    res.status(500).json({ message: 'Error adding PDF', error: error.message });
  }
});

app.post('/api/constitution-pdfs', upload.single('constitutionPdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    console.log('Received file:', req.file); // Debug log

    const constitution = new Constitution({
      name: req.body.name,
      pdf: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    const savedConstitution = await constitution.save();
    console.log('Saved constitution:', savedConstitution); // Debug log
    
    res.status(201).json({
      _id: savedConstitution._id,
      name: savedConstitution.name,
      pdfUrl: `/api/constitution-pdfs/view/${savedConstitution._id}`,
      createdAt: savedConstitution.createdAt
    });
  } catch (error) {
    console.error('Error saving PDF:', error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/media-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid ID provided' });
    }

    console.log('Attempting to delete item with ID:', id);
    
    const deletedItem = await Media.findByIdAndDelete(id);
    
    if (!deletedItem) {
      console.log('No item found with ID:', id);
      return res.status(404).json({ message: 'Media item not found' });
    }

    console.log('Successfully deleted item:', deletedItem._id);
    res.json({ message: 'Media item deleted successfully' });
  } catch (error) {
    console.error('Error in delete route:', error);
    res.status(500).json({ 
      message: 'Error deleting media item',
      error: error.message 
    });
  }
});

app.delete('/api/youtube-videos/:id', async (req, res) => {
  try {
    await Youtube.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'YouTube video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/history-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid ID provided' });
    }

    const deletedItem = await History.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return res.status(404).json({ message: 'History item not found' });
    }
    
    res.json({ message: 'History item deleted successfully' });
  } catch (error) {
    console.error('Error deleting history item:', error);
    res.status(500).json({ 
      message: 'Error deleting history item',
      error: error.message 
    });
  }
});

app.delete('/api/pdf-files/:name', (req, res) => {
  try {
    const pdfName = req.params.name;
    pdfFiles = pdfFiles.filter(pdf => pdf.name !== pdfName);
    res.status(200).json({ message: 'PDF deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting PDF' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large. Max size is 5MB' });
    }
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Constitution Routes
app.get('/api/constitution-pdfs', async (req, res) => {
  try {
    const pdfs = await Constitution.find().sort({ createdAt: -1 });
    const processedPdfs = pdfs.map(pdf => ({
      _id: pdf._id,
      name: pdf.name,
      pdfUrl: `/api/constitution-pdfs/view/${pdf._id}`,
      createdAt: pdf.createdAt
    }));
    res.json(processedPdfs);
  } catch (error) {
    console.error('Error fetching PDFs:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/constitution-pdfs/view/:id', async (req, res) => {
  try {
    const pdf = await Constitution.findById(req.params.id);
    if (!pdf || !pdf.pdf.data) {
      return res.status(404).send('PDF not found');
    }

    res.setHeader('Content-Type', pdf.pdf.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${pdf.name}.pdf"`);
    res.send(pdf.pdf.data);
  } catch (error) {
    console.error('Error streaming PDF:', error);
    res.status(500).send('Error streaming PDF');
  }
});

app.post('/api/constitution-pdfs', upload.single('constitutionPdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    console.log('Received file:', req.file); // Debug log

    const constitution = new Constitution({
      name: req.body.name,
      pdf: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    const savedConstitution = await constitution.save();
    console.log('Saved constitution:', savedConstitution); // Debug log
    
    res.status(201).json({
      _id: savedConstitution._id,
      name: savedConstitution.name,
      pdfUrl: `/api/constitution-pdfs/view/${savedConstitution._id}`,
      createdAt: savedConstitution.createdAt
    });
  } catch (error) {
    console.error('Error saving PDF:', error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/constitution-pdfs/:id', async (req, res) => {
  try {
    const deletedPdf = await Constitution.findByIdAndDelete(req.params.id);
    if (!deletedPdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    res.json({ message: 'PDF deleted successfully' });
  } catch (error) {
    console.error('Error deleting PDF:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET all card room data
app.get('/api/card-room', async (req, res) => {
  try {
    const cardRooms = await CardRoom.find().sort({ createdAt: -1 });
    console.log('Found cards:', cardRooms.length);
    
    // Add null checks and error handling for image processing
    const processedCards = cardRooms.map(card => {
      try {
        return {
          _id: card._id,
          name: card.name,
          description: card.description,
          description2: card.description2,
          imageSrc: card.image && card.image.data && card.image.contentType
            ? `data:${card.image.contentType};base64,${card.image.data.toString('base64')}`
            : null,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt
        };
      } catch (err) {
        console.error('Error processing card:', err);
        return null;
      }
    }).filter(card => card !== null);

    res.json(processedCards);
  } catch (error) {
    console.error('Error in GET /api/card-room:', error);
    res.status(500).json({ 
      message: 'Error fetching card rooms',
      error: error.message 
    });
  }
});

// POST new card room entry
app.post('/api/card-room', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const cardRoom = new CardRoom({
      name: req.body.name,
      description: req.body.description,
      description2: req.body.description2,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    const savedCard = await cardRoom.save();
    
    // Convert the saved card's binary data to base64 for response
    const processedCard = {
      _id: savedCard._id,
      name: savedCard.name,
      description: savedCard.description,
      description2: savedCard.description2,
      imageSrc: `data:${savedCard.image.contentType};base64,${savedCard.image.data.toString('base64')}`,
      createdAt: savedCard.createdAt,
      updatedAt: savedCard.updatedAt
    };

    res.status(201).json(processedCard);
  } catch (error) {
    console.error('Error in POST /api/card-room:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT (edit) card room entry
app.put('/api/card-room/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      description2: req.body.description2
    };

    if (req.file) {
      updateData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const updatedCard = await CardRoom.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedCard) {
      return res.status(404).json({ message: 'Card room not found' });
    }

    // Process the updated card for response
    const processedCard = {
      _id: updatedCard._id,
      name: updatedCard.name,
      description: updatedCard.description,
      description2: updatedCard.description2,
      imageSrc: updatedCard.image ? `data:${updatedCard.image.contentType};base64,${updatedCard.image.data.toString('base64')}` : null,
      createdAt: updatedCard.createdAt,
      updatedAt: updatedCard.updatedAt
    };

    res.json(processedCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Photo Routes
app.get('/api/photos', async (req, res) => {
  try {
    const photos = await Photo.find().sort({ createdAt: -1 });
    
    // Convert Buffer data to base64 strings
    const processedPhotos = photos.map(photo => ({
      _id: photo._id,
      title: photo.title,
      description: photo.description,
      mainImage: `data:${photo.mainImage.contentType};base64,${photo.mainImage.data.toString('base64')}`,
      subImages: photo.subImages.map(img => 
        `data:${img.contentType};base64,${img.data.toString('base64')}`
      ),
      createdAt: photo.createdAt,
      updatedAt: photo.updatedAt
    }));

    res.json(processedPhotos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/photos', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'subImages', maxCount: 10 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.mainImage || !req.files.subImages) {
      return res.status(400).json({ message: 'Both main image and sub images are required' });
    }

    const photo = new Photo({
      title: req.body.title,
      description: req.body.description,
      mainImage: {
        data: req.files.mainImage[0].buffer,
        contentType: req.files.mainImage[0].mimetype
      },
      subImages: req.files.subImages.map(file => ({
        data: file.buffer,
        contentType: file.mimetype
      }))
    });

    const savedPhoto = await photo.save();
    
    // Convert the saved photo's binary data to base64 for the response
    const processedPhoto = {
      _id: savedPhoto._id,
      title: savedPhoto.title,
      description: savedPhoto.description,
      mainImage: `data:${savedPhoto.mainImage.contentType};base64,${savedPhoto.mainImage.data.toString('base64')}`,
      subImages: savedPhoto.subImages.map(img => 
        `data:${img.contentType};base64,${img.data.toString('base64')}`
      ),
      createdAt: savedPhoto.createdAt,
      updatedAt: savedPhoto.updatedAt
    };

    res.status(201).json(processedPhoto);
  } catch (error) {
    console.error('Error creating photo:', error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/photos/:id', async (req, res) => {
  try {
    const deletedPhoto = await Photo.findByIdAndDelete(req.params.id);
    if (!deletedPhoto) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add this DELETE endpoint for card rooms
app.delete('/api/card-room/:id', async (req, res) => {
  try {
    const deletedCard = await CardRoom.findByIdAndDelete(req.params.id);
    if (!deletedCard) {
      return res.status(404).json({ message: 'Card room not found' });
    }
    res.json({ message: 'Card room deleted successfully' });
  } catch (error) {
    console.error('Error deleting card room:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all members
app.get('/api/members', async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    const processedMembers = members.map(member => ({
      _id: member._id,
      name: member.name,
      description: member.description,
      description2: member.description2,
      imageSrc: member.image ? `data:${member.image.contentType};base64,${member.image.data.toString('base64')}` : null
    }));
    res.json(processedMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new member
app.post('/api/members', upload.single('image'), async (req, res) => {
  try {
    const member = new Member({
      name: req.body.name,
      description: req.body.description,
      description2: req.body.description2,
      image: req.file ? {
        data: req.file.buffer,
        contentType: req.file.mimetype
      } : undefined
    });
    const savedMember = await member.save();
    res.status(201).json(savedMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a member
app.put('/api/members/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      description2: req.body.description2
    };
    if (req.file) {
      updateData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }
    const updatedMember = await Member.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedMember) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(updatedMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a member
app.delete('/api/members/:id', async (req, res) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);
    if (!deletedMember) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all slider images
app.get('/api/slider-images', async (req, res) => {
  try {
    const images = await SliderImage.find().sort({ createdAt: -1 });
    const processedImages = images.map(image => ({
      _id: image._id,
      imageSrc: `data:${image.image.contentType};base64,${image.image.data.toString('base64')}`,
      description: image.description
    }));
    res.json(processedImages);
  } catch (error) {
    console.error('Error fetching slider images:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add multiple images
app.post('/api/slider-images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const images = req.files.map(file => ({
      image: {
        data: file.buffer,
        contentType: file.mimetype
      },
      description: req.body.description || ''
    }));

    const savedImages = await SliderImage.insertMany(images);
    res.status(201).json(savedImages);
  } catch (error) {
    console.error('Error saving images:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a slider image
app.delete('/api/slider-images/:id', async (req, res) => {
  try {
    const deletedImage = await SliderImage.findByIdAndDelete(req.params.id);
    if (!deletedImage) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Stream PDF endpoint with better error handling
app.get('/api/history/pdf/:id', async (req, res) => {
  try {
    const item = await History.findById(req.params.id);
    if (!item || !item.pdf || !item.pdf.data) {
      return res.status(404).send('PDF not found');
    }

    res.setHeader('Content-Type', item.pdf.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${item.name}.pdf"`);
    res.send(item.pdf.data);
  } catch (error) {
    console.error('Error streaming PDF:', error);
    res.status(500).send('Error streaming PDF');
  }
});

