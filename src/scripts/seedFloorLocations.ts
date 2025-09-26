import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { FloorLocation } from '../models/FloorLocation';

// This script helps create floor locations with QR codes for testing
// Run with: npm run seed:floors

const seedFloorLocations = async () => {
  try {
    // Connect to MongoDB (make sure to update with your connection string)
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spotworks');
    
    console.log('Connected to MongoDB');

    // Sample facility ID - replace with actual facility ID from your database
    const sampleFacilityId = new mongoose.Types.ObjectId('64a7b8c9d1e2f3a4b5c6d7e8');
    const sampleUserId = new mongoose.Types.ObjectId('64a7b8c9d1e2f3a4b5c6d7e9');

    // Sample floor locations for a 4-floor building
    const floorLocations = [
      {
        facilityId: sampleFacilityId,
        floorName: 'Ground Floor',
        floorNumber: 0,
        description: 'Main entrance, lobby, reception area',
        createdBy: sampleUserId,
        updatedBy: sampleUserId
      },
      {
        facilityId: sampleFacilityId,
        floorName: 'First Floor',
        floorNumber: 1,
        description: 'Office spaces, meeting rooms',
        createdBy: sampleUserId,
        updatedBy: sampleUserId
      },
      {
        facilityId: sampleFacilityId,
        floorName: 'Second Floor',
        floorNumber: 2,
        description: 'Workstations, break rooms',
        createdBy: sampleUserId,
        updatedBy: sampleUserId
      },
      {
        facilityId: sampleFacilityId,
        floorName: 'Third Floor',
        floorNumber: 3,
        description: 'Executive offices, conference rooms',
        createdBy: sampleUserId,
        updatedBy: sampleUserId
      },
      {
        facilityId: sampleFacilityId,
        floorName: 'Fourth Floor',
        floorNumber: 4,
        description: 'Storage, server room, maintenance',
        createdBy: sampleUserId,
        updatedBy: sampleUserId
      }
    ];

    // Delete existing floor locations for this facility
    await FloorLocation.deleteMany({ facilityId: sampleFacilityId });
    console.log('Cleared existing floor locations');

    // Create new floor locations with QR codes
    const createdFloors = [];
    for (const floor of floorLocations) {
      const qrCode = `FL_${sampleFacilityId}_${floor.floorNumber}_${uuidv4().substring(0, 8).toUpperCase()}`;
      
      const floorLocation = new FloorLocation({
        ...floor,
        qrCode
      });

      await floorLocation.save();
      createdFloors.push(floorLocation);
      
      console.log(`Created floor: ${floor.floorName} with QR code: ${qrCode}`);
    }

    console.log(`\n✅ Successfully created ${createdFloors.length} floor locations`);
    
    // Display QR codes for easy reference
    console.log('\n📱 QR Codes for testing:');
    console.log('=' .repeat(60));
    createdFloors.forEach(floor => {
      console.log(`${floor.floorName}: ${floor.qrCode}`);
    });
    console.log('=' .repeat(60));
    
    console.log('\n💡 Next steps:');
    console.log('1. Update the facility ID in this script with your actual facility ID');
    console.log('2. Create hygiene sections using the hygiene section API');
    console.log('3. Upload hygiene checklists using the hygiene checklist API');
    console.log('4. Create daily checklists using the daily checklist API');
    console.log('5. Test QR code scanning with the generated codes above');

  } catch (error) {
    console.error('Error seeding floor locations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the seed function
if (require.main === module) {
  seedFloorLocations();
}

export { seedFloorLocations };
