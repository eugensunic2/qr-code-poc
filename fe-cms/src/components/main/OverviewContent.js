import React, { useState, useEffect, useContext } from 'react';
import ModalWindow from '../utils/ModalWindow';
import { GlobalErrorContext } from '../../App';
import { contentEndpoint } from '../../config';

function OverviewContent() {
	const errorContext = useContext(GlobalErrorContext);
	const [content, setState] = useState({
		overviewArr: [],
		overviewArrCopy: [],
		modeType: null,
		showSubmitButton: true,
		qrCodePath: null,
		qrCodeUniqueId: null,
		image: {
			id: null,
			name: null,
			description: null,
			src: null,
			files: []
		},
		modal: {
			show: false,
			heading: null,
			content: null
		},
		actionButton: {
			name: null,
			color: null,
			borderColor: null
		}
	});

	const [searchValue, search] = useState('');

	const adjustForLayout = (data) => {
		let index = -1;
		return data.reduce((acc, x, i) => {
			if (i % 2 === 0) {
				acc.push([]);
				++index;
			}
			acc[index].push(x);
			return acc;
		}, []);
	};

	const htmlContent = (mode) => {
		switch (mode) {
			case 'EDIT':
				return editContent();
			case 'DELETE':
				return deleteContent();
			case 'ZOOM':
				return qrCodeContent();
			default:
				return '';
		}
	};

	const submitActionButton = (mode) => {
		switch (mode) {
			case 'EDIT':
				return editItemConfirm;
			case 'DELETE':
				return deleteItemConfirm;
			default:
				return '';
		}
	};

	// HTML CONTENT BEGIN
	const editContent = () => {
		return (
			<div className='main-wrapper'>
				<div className='row'>
					<h2></h2>
				</div>
				<span>Image name:</span>
				<div className='row'>
					<input
						name='image-name'
						type='text'
						value={content.image.name}
						placeholder='Image name'
						onChange={(e) =>
							setState({
								...content,
								image: {
									...content.image,
									name: e.target.value
								}
							})
						}
					/>
				</div>
				<span>Image description:</span>
				<div className='row'>
					<textarea
						name='image-description'
						placeholder='Image description'
						value={content.image.description}
						rows='20'
						cols='40'
						className='ui-autocomplete-input'
						autoComplete='off'
						role='textbox'
						onChange={(e) => {
							setState({
								...content,
								image: {
									...content.image,
									description: e.target.value
								}
							});
						}}></textarea>
				</div>
				<span>Current image:</span>
				<img width='170' src={content.image.src} className='d-block' />
				<div className='row'>
					<input
						name='image-file'
						type='file'
						accept='image/*'
						onChange={(e) =>
							setState({
								...content,
								image: {
									...content.image,
									files: e.target.files
								}
							})
						}
					/>
				</div>
			</div>
		);
	};

	const deleteContent = () => {
		return <p>Are you sure you want to delete the selected item?</p>;
	};

	const qrCodeContent = () => {
		return <img width='400' height='400' src={content.qrCodePath} />;
	};

	// HTML CONTENT END

	// HTML MODAL BEGIN
	const invokeDeleteModal = (itemId, imageName) => {
		setState({
			...content,
			modeType: 'DELETE',
			showSubmitButton: true,
			modal: {
				...content.modal,
				show: true,
				heading: `Delete ${imageName}`
			},
			image: { ...content.image, id: itemId },
			actionButton: {
				...content.actionButton,
				name: 'Delete',
				color: '#dc3545',
				borderColor: '#dc3545'
			}
		});
	};

	const invokeEditModal = (itemId, imageName, imageDescription, imageSrc) => {
		setState({
			...content,
			modeType: 'EDIT',
			showSubmitButton: true,
			modal: {
				...content.modal,
				show: true,
				heading: `Edit ${imageName}`
			},
			image: {
				...content.image,
				id: itemId,
				name: imageName,
				description: imageDescription,
				src: imageSrc
			},
			actionButton: {
				...content.actionButton,
				name: 'Submit',
				color: '#007bff',
				borderColor: '#007bff'
			}
		});
	};

	const invokeQrCodeModal = (path, imageName) => {
		setState({
			...content,
			modeType: 'ZOOM',
			showSubmitButton: false,
			modal: {
				...content.modal,
				show: true,
				heading: `QR code for ${imageName}`
			},
			qrCodePath: path
		});
	};

	// HTML MODAL END
	// MODAL CONFIRM BUTTON BEGIN
	const deleteItemConfirm = () => {
		fetch(contentEndpoint.OVERVIEW_CONTENT_DELETE, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				itemId: content.image.id
			})
		})
			.then((res) => {
				if (res.ok) {
					return res.json();
				}
				throw new Error('error');
			})
			.then((_) =>
				setState({
					...content,
					modal: {
						...content.modal,
						show: false
					},
					overviewArr: adjustForLayout(
						content.overviewArr
							.map((array) =>
								array.filter((x) => x.id !== content.image.id)
							)
							.reduce((acc, arr) => [...acc, ...arr], [])
					)
				})
			)
			.catch((err) => console.log(err));
	};

	const editItemConfirm = () => {
		const form = new FormData();

		form.append('file', content.image.id);
		form.append('file', content.image.name);
		form.append('file', content.image.description);
		form.append('file', content.image.files[0]);

		fetch(contentEndpoint.OVERVIEW_CONTENT_EDIT, {
			method: 'POST',
			body: form
		})
			.then((res) => res.json())
			.then((res) =>
				setState({
					...content,
					modal: { ...content.modal, show: false },
					overviewArr: content.overviewArr.map((arr) => {
						return arr.map((x) => {
							if (x.id === res.id) {
								return {
									...res,
									qrCodeUniqueId: x.qrCodeUniqueId,
									image: {
										...res.image
									}
								};
							}
							return x;
						});
					})
				})
			)
			.catch((_) => {
				setState({
					...content,
					modal: { ...content.modal, show: false }
				});
				errorContext.dispatchError({
					type: 'global',
					payload: 'Server error ocurred'
				});
			});
	};

	// MODAL CONFIRM BUTTON END
	const closeModal = () => {
		setState({ ...content, modal: { ...content.modal, show: false } });
	};

	useEffect(() => {
		console.log('here');
		setState({
			...content,
			overviewArr: adjustForLayout(
				content.overviewArrCopy
					.reduce((acc, arr) => [...acc, ...arr], [])
					.filter(
						(x) =>
							x.imageName
								.toLowerCase()
								.indexOf(searchValue.toLowerCase()) > -1
					)
			)
		});
	}, [searchValue]);

	useEffect(() => {
		fetch(contentEndpoint.OVERVIEW_CONTENT)
			.then((res) => {
				if (res.ok) {
					return res.json();
				}
				throw new Error('error');
			})
			.then((res) =>
				setState({
					...content,
					overviewArr: adjustForLayout(res),
					overviewArrCopy: adjustForLayout(res)
				})
			)
			.catch((err) => console.log(err));
	}, []);

	// if (!content.overviewArr.length) {
	//   return <div className="empty-content">No content added yet!</div>;
	// }
	return (
		<div>
			<div class='form-group row' style={{ marginTop: 15 }}>
				<label for='searchImageName' class='col-form-label'>
					Image name:
				</label>
				<div class='col-sm-10'>
					<input
						id='searchImageName'
						type='text'
						placeholder='search...'
						class='form-control'
						value={searchValue}
						onChange={(e) => search(e.target.value)}
					/>
				</div>
			</div>
			{content.overviewArr.map((arr, i) => (
				<div key={i} className='row'>
					{arr.map((obj, j) => (
						<article
							key={j}
							className='col-sm-12 col-md-6 overview-item'>
							<h2 className='text-wrapper'>{obj.imageName}</h2>
							<img width='50%' src={obj.path} />
							<p className='text-wrapper'>
								{obj.imageDescription}
							</p>
							<a
								href={'/view-image/' + obj.qrCodeUniqueId}
								target='_blank'>
								Visit page
							</a>
							<div className='buttonContainer bg-dark rounded'>
								<button
									type='button'
									className='btn btn-danger d-inline'
									onClick={() =>
										invokeDeleteModal(obj.id, obj.imageName)
									}>
									Delete
								</button>
								<button
									type='button'
									className='btn btn-warning d-inline ml-1'
									onClick={() =>
										invokeEditModal(
											obj.id,
											obj.imageName,
											obj.imageDescription,
											obj.path
										)
									}>
									Edit
								</button>
								<button
									type='button'
									className='btn btn-success d-inline ml-1'
									onClick={() =>
										invokeQrCodeModal(
											obj.qrCode,
											obj.imageName
										)
									}>
									QR Kod
								</button>
							</div>
						</article>
					))}
				</div>
			))}
			<ModalWindow
				html={htmlContent(content.modeType)}
				content={content}
				handleAction={submitActionButton(content.modeType)}
				handleClose={closeModal}
			/>
		</div>
	);
}

export default OverviewContent;
