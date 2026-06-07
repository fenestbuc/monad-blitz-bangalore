// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Notebook {
    struct NoteHash {
        bytes32 hash;
        address author;
        uint256 timestamp;
    }

    // Array of all notes sequentially added
    NoteHash[] public notes;

    event NoteAdded(uint256 indexed index, bytes32 indexed hash, address indexed author);

    function addNoteHash(bytes32 _hash) external {
        notes.push(NoteHash({
            hash: _hash,
            author: msg.sender,
            timestamp: block.timestamp
        }));
        
        emit NoteAdded(notes.length - 1, _hash, msg.sender);
    }

    function getNotesCount() external view returns (uint256) {
        return notes.length;
    }

    function getNoteHash(uint256 index) external view returns (bytes32, address, uint256) {
        require(index < notes.length, "Note does not exist");
        NoteHash memory note = notes[index];
        return (note.hash, note.author, note.timestamp);
    }
}
